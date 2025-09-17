from pydantic import BaseModel, UUID4
from typing import Optional


class MarketingAccountBase(BaseModel):
    name: str
    description: Optional[str] = None


class MarketingAccountCreate(MarketingAccountBase):
    pass


class MarketingAccountUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class MarketingAccountInDB(BaseModel):
    id: UUID4
    name: str
    description: Optional[str] = None

    class Config:
        orm_mode = True


class SmtpCredentialIn(BaseModel):
    host: str
    port: str
    encryption: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    from_name: Optional[str] = None
    from_address: Optional[str] = None
    reply_to: Optional[str] = None


class SmsCredentialIn(BaseModel):
    api_key: Optional[str] = None
    client_id: Optional[str] = None
    secret: Optional[str] = None
    provider: Optional[str] = None


class WhatsappCredentialIn(BaseModel):
    api_key: Optional[str] = None
    client_id: Optional[str] = None
    secret: Optional[str] = None
    provider: Optional[str] = None


class MarketingCredentialsIn(BaseModel):
    smtp: Optional[SmtpCredentialIn] = None
    sms: Optional[SmsCredentialIn] = None
    whatsapp: Optional[WhatsappCredentialIn] = None


