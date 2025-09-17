import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.database.base import Base


class TemplateAttachment(Base):
    __tablename__ = "template_attachments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    template_id = Column(UUID(as_uuid=True), ForeignKey("templates.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    content_type = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    template = relationship("Template", back_populates="attachments")


