from pydantic import BaseModel, UUID4
from typing import Optional, List
from datetime import datetime
from src.models.campaign import CampaignStatus
from src.models.campaign_lead import EmailStatus

class CampaignBase(BaseModel):
    name: str
    subject: str
    body: str

class CampaignCreate(CampaignBase):
    pass

class CampaignUpdate(CampaignBase):
    status: Optional[CampaignStatus] = None

class CampaignInDB(CampaignBase):
    id: UUID4
    user_id: UUID4
    status: CampaignStatus

    class Config:
        orm_mode = True


class CampaignDispatchRequest(BaseModel):
    lead_ids: Optional[List[UUID4]] = None
    area_of_expertise_ids: Optional[List[UUID4]] = None


class CampaignLeadInDB(BaseModel):
    id: UUID4
    campaign_id: UUID4
    lead_id: UUID4
    status: EmailStatus
    sent_at: datetime | None = None

    class Config:
        orm_mode = True
