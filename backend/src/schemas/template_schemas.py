from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class TemplateAttachmentIn(BaseModel):
    file_name: Optional[str] = None
    file_url: str
    content_type: Optional[str] = None


class TemplateAttachmentOut(BaseModel):
    id: UUID
    file_name: str
    file_url: str
    content_type: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class TemplateBase(BaseModel):
    subject: str
    content: str
    channel_id: Optional[UUID] = None
    campaign_id: Optional[UUID] = None


class TemplateCreate(TemplateBase):
    attachments: Optional[List[TemplateAttachmentIn]] = None


class TemplateUpdate(BaseModel):
    subject: Optional[str] = None
    content: Optional[str] = None
    channel_id: Optional[UUID] = None
    campaign_id: Optional[UUID] = None
    attachments: Optional[List[TemplateAttachmentIn]] = None


class TemplateOut(TemplateBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    attachments: List[TemplateAttachmentOut] = Field(default_factory=list)

    class Config:
        from_attributes = True


