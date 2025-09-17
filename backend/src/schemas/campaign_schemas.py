from pydantic import BaseModel, UUID4, Field
from typing import Optional, List
from datetime import datetime
from src.models.campaign import CampaignStatus, CampaignObjective
from src.models.campaign_lead import EmailStatus

class CampaignBase(BaseModel):
    # Manter compat de frontend atual (name) + novo alias title
    title: str = Field(alias="title")
    subject: str
    body: Optional[str] = None
    channel_ids: List[str] = []
    area_ids: List[str] = []
    template: Optional[dict] = None  # {subject, content} (compat)
    templates: Optional[List[dict]] = None  # [{subject, content, channel_id, attachments?: [{file_url,file_name,content_type}]}]
    marketing_account_id: Optional[str] = None
    objective: Optional[CampaignObjective] = None

class CampaignCreate(CampaignBase):
    pass

class CampaignUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    body: Optional[str] = None
    channel_ids: Optional[List[str]] = None
    area_ids: Optional[List[str]] = None
    template: Optional[dict] = None
    templates: Optional[List[dict]] = None
    marketing_account_id: Optional[str] = None
    status: Optional[CampaignStatus] = None
    objective: Optional[CampaignObjective] = None

class CampaignInDB(BaseModel):
    id: UUID4
    user_id: UUID4
    status: Optional[CampaignStatus] = None
    title: str
    subject: Optional[str] = None
    body: Optional[str] = None
    channels: List[dict] = []
    areas: List[dict] = []
    templates: List[dict] = []  # [{subject, content, channel_id, attachments: [...] }]
    objective: Optional[CampaignObjective] = None
    marketing_account_id: Optional[str] = None

    class Config:
        orm_mode = True
        populate_by_name = True


class CampaignDispatchRequest(BaseModel):
    lead_ids: Optional[List[UUID4]] = None
    area_of_expertise_ids: Optional[List[UUID4]] = None


class CampaignDispatchResponse(BaseModel):
    job_id: str


class CampaignLeadInDB(BaseModel):
    id: UUID4
    campaign_id: UUID4
    lead_id: UUID4
    status: EmailStatus
    sent_at: datetime | None = None

    class Config:
        orm_mode = True
