from src.repositories.base_repository import BaseRepository
from src.models.campaign import Campaign
from sqlalchemy.orm import Session

class CampaignRepository(BaseRepository[Campaign]):
    def __init__(self):
        super().__init__(Campaign)

    def count_all(self, db: Session) -> int:
        return db.query(Campaign).count()

campaign_repository = CampaignRepository()
