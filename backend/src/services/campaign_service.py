from sqlalchemy.orm import Session
from typing import List
from src.repositories.campaign_repository import campaign_repository
from src.schemas.campaign_schemas import CampaignCreate, CampaignUpdate
from src.models.campaign import Campaign
from src.models.campaign_lead import CampaignLead
from src.repositories.base_repository import BaseRepository
from sqlalchemy.orm import Session
from src.models.lead import Lead


class CampaignService:
    def create_campaign(self, db: Session, *, campaign_in: CampaignCreate, user_id: str) -> Campaign:
        data = campaign_in.model_dump()
        data["user_id"] = user_id
        return campaign_repository.create(db, obj_in=data)

    def update_campaign(self, db: Session, *, campaign_id: str, campaign_in: CampaignUpdate) -> Campaign:
        campaign = campaign_repository.get(db, campaign_id)
        return campaign_repository.update(db, db_obj=campaign, obj_in=campaign_in.model_dump(exclude_unset=True))

    def delete_campaign(self, db: Session, *, campaign_id: str) -> Campaign:
        return campaign_repository.remove(db, id=campaign_id)

    def get_campaigns(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Campaign]:
        return campaign_repository.get_all(db, skip=skip, limit=limit)

    def get_campaign(self, db: Session, *, campaign_id: str) -> Campaign | None:
        return campaign_repository.get(db, campaign_id)

campaign_service = CampaignService()
