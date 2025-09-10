from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from typing import List
from src.database.session import get_db
from src.schemas.campaign_schemas import CampaignCreate, CampaignUpdate, CampaignInDB, CampaignDispatchRequest
from src.services.campaign_service import campaign_service
from src.utils.security import get_current_user
from src.models.user import User
from src.utils.queue import get_queue
from src.scripts.worker_tasks import dispatch_campaign

router = APIRouter()


@router.get("/", response_model=List[CampaignInDB])
def list_campaigns(
    response: Response,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
):
    items = campaign_service.get_campaigns(db, skip=skip, limit=limit)
    # Opcionalmente poderíamos expor contagem total quando existir
    response.headers["X-Total-Count"] = "-1"
    return items


@router.post("/", response_model=CampaignInDB)
def create_campaign(
    *,
    db: Session = Depends(get_db),
    campaign_in: CampaignCreate,
    current_user: User = Depends(get_current_user),
):
    return campaign_service.create_campaign(db, campaign_in=campaign_in, user_id=current_user.id)


@router.put("/{campaign_id}", response_model=CampaignInDB)
def update_campaign(
    *,
    db: Session = Depends(get_db),
    campaign_id: str,
    campaign_in: CampaignUpdate,
    current_user: User = Depends(get_current_user),
):
    return campaign_service.update_campaign(db, campaign_id=campaign_id, campaign_in=campaign_in)


@router.delete("/{campaign_id}", response_model=CampaignInDB)
def delete_campaign(
    *,
    db: Session = Depends(get_db),
    campaign_id: str,
    current_user: User = Depends(get_current_user),
):
    return campaign_service.delete_campaign(db, campaign_id=campaign_id)


@router.post("/{campaign_id}/dispatch", response_model=int)
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
    return 1
