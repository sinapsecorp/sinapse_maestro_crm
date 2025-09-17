from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from src.database.session import get_db
from src.utils.security import get_current_user
from src.models.user import User
from src.schemas.marketing_schemas import (
    MarketingAccountCreate,
    MarketingAccountUpdate,
    MarketingAccountInDB,
    MarketingCredentialsIn,
    SmtpCredentialIn,
    SmsCredentialIn,
    WhatsappCredentialIn,
)
from src.services.marketing_service import marketing_service


router = APIRouter(prefix="/marketing", tags=["marketing"])


@router.get("/accounts", response_model=List[MarketingAccountInDB])
def list_accounts(
    *,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
):
    return marketing_service.list_accounts(db, skip=skip, limit=limit)


@router.post("/accounts", response_model=MarketingAccountInDB)
def create_account(
    *,
    db: Session = Depends(get_db),
    data: MarketingAccountCreate,
    current_user: User = Depends(get_current_user),
):
    return marketing_service.create_account(db, data=data)


@router.put("/accounts/{account_id}", response_model=MarketingAccountInDB)
def update_account(
    *,
    db: Session = Depends(get_db),
    account_id: str,
    data: MarketingAccountUpdate,
    current_user: User = Depends(get_current_user),
):
    acc = marketing_service.update_account(db, account_id=account_id, data=data)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    return acc


@router.delete("/accounts/{account_id}", response_model=MarketingAccountInDB)
def delete_account(
    *,
    db: Session = Depends(get_db),
    account_id: str,
    current_user: User = Depends(get_current_user),
):
    acc = marketing_service.delete_account(db, account_id=account_id)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    return acc


@router.put("/accounts/{account_id}/credentials/smtp")
def upsert_smtp_credentials(
    *, db: Session = Depends(get_db), account_id: str, data: SmtpCredentialIn, current_user: User = Depends(get_current_user)
):
    cred = marketing_service.upsert_smtp(db, account_id=account_id, data=data)
    return {"id": str(cred.id)}


@router.put("/accounts/{account_id}/credentials/sms")
def upsert_sms_credentials(
    *, db: Session = Depends(get_db), account_id: str, data: SmsCredentialIn, current_user: User = Depends(get_current_user)
):
    cred = marketing_service.upsert_sms(db, account_id=account_id, data=data)
    return {"id": str(cred.id)}


@router.put("/accounts/{account_id}/credentials/whatsapp")
def upsert_whatsapp_credentials(
    *, db: Session = Depends(get_db), account_id: str, data: WhatsappCredentialIn, current_user: User = Depends(get_current_user)
):
    cred = marketing_service.upsert_whatsapp(db, account_id=account_id, data=data)
    return {"id": str(cred.id)}


@router.get("/accounts/{account_id}/credentials")
def get_account_credentials(
    *, db: Session = Depends(get_db), account_id: str, current_user: User = Depends(get_current_user)
):
    smtp = marketing_service.get_smtp(db, account_id=account_id)
    sms = marketing_service.get_sms(db, account_id=account_id)
    wapp = marketing_service.get_whatsapp(db, account_id=account_id)

    def smtp_out():
        if not smtp:
            return None
        return {
            "host": getattr(smtp, "host", None),
            "port": getattr(smtp, "port", None),
            "encryption": getattr(smtp, "encryption", None),
            "from_name": getattr(smtp, "from_name", None),
            "from_address": getattr(smtp, "from_address", None),
            "reply_to": getattr(smtp, "reply_to", None),
            "has_username": bool(getattr(smtp, "username_enc", None)),
            "has_password": bool(getattr(smtp, "password_enc", None)),
        }

    def sms_out():
        if not sms:
            return None
        return {
            "provider": getattr(sms, "provider", None),
            "has_api_key": bool(getattr(sms, "api_key_enc", None)),
            "has_client_id": bool(getattr(sms, "client_id_enc", None)),
            "has_secret": bool(getattr(sms, "secret_enc", None)),
        }

    def wapp_out():
        if not wapp:
            return None
        return {
            "provider": getattr(wapp, "provider", None),
            "has_api_key": bool(getattr(wapp, "api_key_enc", None)),
            "has_client_id": bool(getattr(wapp, "client_id_enc", None)),
            "has_secret": bool(getattr(wapp, "secret_enc", None)),
        }

    return {
        "smtp": smtp_out(),
        "sms": sms_out(),
        "whatsapp": wapp_out(),
    }


