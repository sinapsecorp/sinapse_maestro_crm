import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.database.base import Base


class SmtpCredential(Base):
    __tablename__ = "smtp_credentials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("marketing_accounts.id", ondelete="CASCADE"), unique=True, nullable=False)

    # plain host/port/encryption; username/password encrypted; from fields plain
    host = Column(String, nullable=False)
    port = Column(String, nullable=False)
    encryption = Column(String, nullable=True)  # tls|ssl|empty
    username_enc = Column(String, nullable=True)
    password_enc = Column(String, nullable=True)
    from_name = Column(String, nullable=True)
    from_address = Column(String, nullable=True)
    reply_to = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    account = relationship("MarketingAccount", back_populates="smtp_credentials")


class SmsCredential(Base):
    __tablename__ = "sms_credentials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("marketing_accounts.id", ondelete="CASCADE"), unique=True, nullable=False)

    api_key_enc = Column(String, nullable=True)
    client_id_enc = Column(String, nullable=True)
    secret_enc = Column(String, nullable=True)

    provider = Column(String, nullable=True)  # opcional: nome do provedor
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    account = relationship("MarketingAccount", back_populates="sms_credentials")


class WhatsappCredential(Base):
    __tablename__ = "whatsapp_credentials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("marketing_accounts.id", ondelete="CASCADE"), unique=True, nullable=False)

    api_key_enc = Column(String, nullable=True)
    client_id_enc = Column(String, nullable=True)
    secret_enc = Column(String, nullable=True)

    provider = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    account = relationship("MarketingAccount", back_populates="whatsapp_credentials")


