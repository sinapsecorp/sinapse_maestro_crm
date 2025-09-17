import uuid
from enum import Enum
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Enum as EnumType, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.database.base import Base

class EmailStatus(str, Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    FAILED = "FAILED"
    DELIVERED = "DELIVERED"
    OPENED = "OPENED"
    CLICKED = "CLICKED"
    CONVERTED = "CONVERTED"

class CampaignLead(Base):
    __tablename__ = "campaign_leads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False)
    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=False)
    channel_id = Column(UUID(as_uuid=True), ForeignKey("channels.id"), nullable=True)
    
    sent_at = Column(DateTime, nullable=True)
    status = Column(EnumType(EmailStatus), default=EmailStatus.PENDING)
    delivered_at = Column(DateTime, nullable=True)
    opened_at = Column(DateTime, nullable=True)
    error_reason = Column(String, nullable=True)

    campaign = relationship("Campaign", back_populates="leads")
    lead = relationship("Lead", back_populates="campaigns")
