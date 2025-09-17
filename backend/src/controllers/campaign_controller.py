from fastapi import APIRouter, Depends, Response, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from src.utils.pagination import normalize_pagination
from src.database.session import get_db
from src.schemas.campaign_schemas import CampaignCreate, CampaignUpdate, CampaignInDB, CampaignDispatchRequest, CampaignDispatchResponse
from src.services.campaign_service import campaign_service
from src.utils.security import get_current_user
from src.models.user import User
from src.utils.queue import get_queue, get_redis_connection
from rq.job import Job
from redis import Redis
from src.scripts.worker_tasks import dispatch_campaign
from fastapi.responses import HTMLResponse
from datetime import datetime
from src.models.campaign_lead import CampaignLead, EmailStatus

router = APIRouter()


def _to_out(c):
    return {
        "id": c.id,
        "user_id": c.user_id,
        "status": c.status,
        "objective": getattr(c, 'objective', None),
        "marketing_account_id": (str(getattr(c, 'marketing_account_id')) if getattr(c, 'marketing_account_id', None) else None),
        "title": c.name,
        "subject": c.subject,
        "body": c.body,
        "channels": [{"id": ch.id, "name": ch.name} for ch in getattr(c, "channels", [])],
        "areas": [{"id": a.id, "name": a.name} for a in getattr(c, "areas", [])],
        "templates": [
            {
                "id": getattr(t, 'id', None),
                "subject": getattr(t, 'subject', ''),
                "content": getattr(t, 'content', ''),
                "channel_id": getattr(t, 'channel_id', None),
                "attachments": [
                    {
                        "id": getattr(a, 'id', None),
                        "file_name": getattr(a, 'file_name', ''),
                        "file_url": getattr(a, 'file_url', ''),
                        "content_type": getattr(a, 'content_type', None),
                    }
                    for a in getattr(t, 'attachments', [])
                ],
            }
            for t in getattr(c, "templates", [])
        ],
    }


@router.get("/", response_model=List[CampaignInDB])
def list_campaigns(
    response: Response,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    page: int | None = None,
    page_size: int | None = None,
    q: str | None = None,
    status: str | None = None,
    current_user: User = Depends(get_current_user),
):
    s, l = normalize_pagination(page=page, page_size=page_size, skip=skip, limit=limit)
    items = campaign_service.get_campaigns(db, skip=s, limit=l, q=q, status=status)
    # Opcionalmente poderíamos expor contagem total quando existir
    try:
        from src.repositories.campaign_repository import campaign_repository
        total = campaign_repository.count_filtered(db, q=q, status=status)
        response.headers["X-Total-Count"] = str(total)
    except Exception:
        response.headers["X-Total-Count"] = "-1"
    return [_to_out(i) for i in items]


@router.post("/", response_model=CampaignInDB)
def create_campaign(
    *,
    db: Session = Depends(get_db),
    campaign_in: CampaignCreate,
    current_user: User = Depends(get_current_user),
):
    try:
        c = campaign_service.create_campaign(db, campaign_in=campaign_in, user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    return _to_out(c)


@router.get("/{campaign_id}", response_model=CampaignInDB)
def get_campaign(
    *,
    db: Session = Depends(get_db),
    campaign_id: str,
    current_user: User = Depends(get_current_user),
):
    c = campaign_service.get_campaign(db, campaign_id=campaign_id)
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return _to_out(c)


@router.put("/{campaign_id}", response_model=CampaignInDB)
def update_campaign(
    *,
    db: Session = Depends(get_db),
    campaign_id: str,
    campaign_in: CampaignUpdate,
    current_user: User = Depends(get_current_user),
):
    c = campaign_service.update_campaign(db, campaign_id=campaign_id, campaign_in=campaign_in)
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return _to_out(c)


@router.delete("/{campaign_id}", response_model=CampaignInDB)
def delete_campaign(
    *,
    db: Session = Depends(get_db),
    campaign_id: str,
    current_user: User = Depends(get_current_user),
):
    c = campaign_service.delete_campaign(db, campaign_id=campaign_id)
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return _to_out(c)


@router.post("/{campaign_id}/dispatch", response_model=CampaignDispatchResponse)
def dispatch(
    *,
    campaign_id: str,
    req: CampaignDispatchRequest | None = None,
    current_user: User = Depends(get_current_user),
):
    q = get_queue()
    lead_ids = req.lead_ids if req else None
    area_ids = req.area_of_expertise_ids if req else None
    job = q.enqueue(dispatch_campaign, campaign_id, lead_ids, area_ids)
    return {"job_id": job.id}


@router.get("/{campaign_id}/dispatch/status")
def dispatch_status(*, campaign_id: str, job_id: str):
    conn = get_redis_connection()
    try:
        job = Job.fetch(job_id, connection=conn)
    except Exception:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "id": job.id,
        "status": job.get_status(refresh=True),
        "meta": job.meta or {},
        "ended_at": str(getattr(job, 'ended_at', '')),
        "started_at": str(getattr(job, 'started_at', '')),
    }


@router.get("/{campaign_id}/events/open/{campaign_lead_id}", response_class=HTMLResponse)
def track_open(
    *,
    db: Session = Depends(get_db),
    campaign_id: str,
    campaign_lead_id: str,
):
    cl = (
        db.query(CampaignLead)
        .filter(CampaignLead.id == campaign_lead_id, CampaignLead.campaign_id == campaign_id)
        .first()
    )
    if cl is not None:
        if cl.opened_at is None:
            cl.opened_at = datetime.utcnow()
            cl.status = EmailStatus.OPENED
            db.add(cl)
            db.commit()
    # retorna um pixel 1x1 transparente (base64)
    pixel = (
        "<img src=\"data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==\" alt=\"\" width=\"1\" height=\"1\"/>"
    )
    return pixel


@router.post("/{campaign_id}/duplicate", response_model=CampaignInDB)
def duplicate_campaign(
    *,
    db: Session = Depends(get_db),
    campaign_id: str,
    current_user: User = Depends(get_current_user),
):
    c = campaign_service.duplicate_campaign(db, campaign_id=campaign_id, user_id=current_user.id)
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return _to_out(c)


@router.post("/{campaign_id}/pause")
def pause_campaign(*, campaign_id: str):
    conn = get_redis_connection()
    conn.setex(f"campaign:{campaign_id}:paused", 60 * 60, "1")  # pausa por até 1h
    return {"paused": True}


@router.post("/{campaign_id}/resume")
def resume_campaign(*, campaign_id: str):
    conn = get_redis_connection()
    conn.delete(f"campaign:{campaign_id}:paused")
    return {"paused": False}
