import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.database.base import Base


class MarketingAccount(Base):
    __tablename__ = "marketing_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    smtp_credentials = relationship("SmtpCredential", uselist=False, back_populates="account", cascade="all, delete-orphan")
    sms_credentials = relationship("SmsCredential", uselist=False, back_populates="account", cascade="all, delete-orphan")
    whatsapp_credentials = relationship("WhatsappCredential", uselist=False, back_populates="account", cascade="all, delete-orphan")


