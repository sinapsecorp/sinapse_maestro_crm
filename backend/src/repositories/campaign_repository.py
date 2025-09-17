from src.repositories.base_repository import BaseRepository
from src.models.campaign import Campaign, CampaignStatus
from sqlalchemy.orm import Session
from sqlalchemy import or_, literal

class CampaignRepository(BaseRepository[Campaign]):
    def __init__(self):
        super().__init__(Campaign)

    def count_all(self, db: Session) -> int:
        return db.query(Campaign).count()

    def get_all_filtered(self, db: Session, *, skip: int = 0, limit: int = 100, q: str | None = None, status: str | None = None) -> list[Campaign]:
        query = db.query(Campaign)
        # Por padrão, não listar ARQUIVADAS; porém evite comparar com valores não existentes no enum do banco.
        # Estratégia segura: incluir apenas statuses conhecidos (DRAFT, SENT, SCHEDULED) ou NULL.
        if not status:
            allowed_status = [CampaignStatus.DRAFT, CampaignStatus.SENT, CampaignStatus.SCHEDULED]
            query = query.filter(
                or_(
                    Campaign.status.is_(None),
                    Campaign.status.in_(allowed_status),
                )
            )
        if q:
            like = f"%{q}%"
            query = query.filter(Campaign.name.ilike(like))
        if status:
            query = query.filter(Campaign.status == status)
        return query.offset(skip).limit(limit).all()

    def count_filtered(self, db: Session, *, q: str | None = None, status: str | None = None) -> int:
        query = db.query(Campaign)
        if q:
            like = f"%{q}%"
            query = query.filter(Campaign.name.ilike(like))
        if status:
            query = query.filter(Campaign.status == status)
        return query.count()

campaign_repository = CampaignRepository()
