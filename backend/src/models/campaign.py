import uuid
from enum import Enum
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as EnumType
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.database.base import Base

class CampaignStatus(str, Enum):
    DRAFT = "DRAFT"
    SENT = "SENT"
    SCHEDULED = "SCHEDULED"
    ARCHIVED = "ARCHIVED"

class CampaignObjective(str, Enum):
    LEAD_GENERATION = "LEAD_GENERATION"
    BRAND_AWARENESS = "BRAND_AWARENESS"
    PRODUCT_PROMOTION = "PRODUCT_PROMOTION"
    CSAT = "CSAT"

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    body = Column(String, nullable=False)
    status = Column(EnumType(CampaignStatus), default=CampaignStatus.DRAFT)
    objective = Column(EnumType(CampaignObjective), nullable=True)
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    template_id = Column(UUID(as_uuid=True), ForeignKey("templates.id"), nullable=True)
    marketing_account_id = Column(UUID(as_uuid=True), ForeignKey("marketing_accounts.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    sent_at = Column(DateTime, nullable=True)

    user = relationship("User")
    leads = relationship("CampaignLead", back_populates="campaign")
    # Template "padrão" da campanha (um-para-um) referenciado por Campaign.template_id
    template = relationship(
        "Template",
        foreign_keys=[template_id],
        uselist=False,
    )
    # Lista de templates pertencentes à campanha via Template.campaign_id (um-para-muitos)
    templates = relationship(
        "Template",
        back_populates="campaign",
        foreign_keys="Template.campaign_id",
        cascade="all, delete-orphan",
    )
    channels = relationship("Channel", secondary="campaign_channels")
    areas = relationship("AreaOfExpertise", secondary="campaign_areas")
