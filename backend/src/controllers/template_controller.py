from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from src.database.session import get_db
from src.utils.security import get_current_user
from src.models.user import User
from src.models.template import Template
from src.models.campaign import Campaign
from src.models.template_attachment import TemplateAttachment
from src.schemas.template_schemas import TemplateCreate, TemplateUpdate, TemplateOut
from src.repositories.template_repository import template_repository


router = APIRouter(prefix="/templates", tags=["templates"])


def _to_out(t: Template) -> TemplateOut:
    return TemplateOut.model_validate(t)


@router.get("/", response_model=List[TemplateOut])
def list_templates(
    *, db: Session = Depends(get_db), skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_user)
):
    items = template_repository.get_all(db, skip=skip, limit=limit)
    return [_to_out(i) for i in items]


@router.get("/{template_id}", response_model=TemplateOut)
def get_template(*, db: Session = Depends(get_db), template_id: str, current_user: User = Depends(get_current_user)):
    t = template_repository.get(db, template_id)
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    return _to_out(t)


@router.post("/", response_model=TemplateOut)
def create_template(
    *, db: Session = Depends(get_db), data: TemplateCreate, current_user: User = Depends(get_current_user)
):
    t = Template(
        subject=data.subject,
        content=data.content,
        channel_id=data.channel_id,
        campaign_id=data.campaign_id,
    )
    db.add(t)
    db.flush()

    for a in (data.attachments or []):
        att = TemplateAttachment(
            template_id=t.id,
            file_name=a.file_name or "arquivo",
            file_url=a.file_url,
            content_type=a.content_type,
        )
        db.add(att)

    db.commit()
    db.refresh(t)
    return _to_out(t)


@router.put("/{template_id}", response_model=TemplateOut)
def update_template(
    *, db: Session = Depends(get_db), template_id: str, data: TemplateUpdate, current_user: User = Depends(get_current_user)
):
    t = template_repository.get(db, template_id)
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")

    if data.subject is not None:
        t.subject = data.subject
    if data.content is not None:
        t.content = data.content
    if data.channel_id is not None:
        t.channel_id = data.channel_id
    if data.campaign_id is not None:
        t.campaign_id = data.campaign_id

    # sobrescrever anexos se fornecidos
    if data.attachments is not None:
        for old in list(getattr(t, "attachments", []) or []):
            db.delete(old)
        for a in (data.attachments or []):
            att = TemplateAttachment(
                template_id=t.id,
                file_name=a.file_name or "arquivo",
                file_url=a.file_url,
                content_type=a.content_type,
            )
            db.add(att)

    db.add(t)
    db.commit()
    db.refresh(t)
    return _to_out(t)


@router.delete("/{template_id}")
def delete_template(*, db: Session = Depends(get_db), template_id: str, current_user: User = Depends(get_current_user)):
    t = template_repository.get(db, template_id)
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    # Desvincular campanhas que usam este template como "template padrão"
    # para evitar violação de FK (campaigns.template_id -> templates.id)
    campaigns = db.query(Campaign).filter(Campaign.template_id == t.id).all()
    for c in campaigns:
        c.template_id = None
        db.add(c)

    db.delete(t)
    db.commit()
    return {"id": str(template_id)}


