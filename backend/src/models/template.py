import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.database.base import Base


class Template(Base):
    __tablename__ = "templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject = Column(String, nullable=False)
    # Usa Text para suportar HTML completo (head, metas, styles) sem limite prático
    content = Column(Text, nullable=False)
    editor_config = Column(JSON, nullable=True)
    channel_id = Column(UUID(as_uuid=True), ForeignKey("channels.id"), nullable=True)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    campaign = relationship(
        "Campaign",
        back_populates="templates",
        foreign_keys=[campaign_id],
    )

    attachments = relationship(
        "TemplateAttachment",
        back_populates="template",
        cascade="all, delete-orphan",
    )


