from sqlalchemy.orm import Session
from typing import Optional
from src.repositories.marketing_repository import (
    marketing_account_repository,
    smtp_credential_repository,
    sms_credential_repository,
    whatsapp_credential_repository,
)
from src.schemas.marketing_schemas import (
    MarketingAccountCreate,
    MarketingAccountUpdate,
    SmtpCredentialIn,
    SmsCredentialIn,
    WhatsappCredentialIn,
)
from src.utils.crypto import encrypt_str


class MarketingService:
    # Accounts
    def create_account(self, db: Session, *, data: MarketingAccountCreate):
        return marketing_account_repository.create(db, obj_in=data.model_dump())

    def update_account(self, db: Session, *, account_id: str, data: MarketingAccountUpdate):
        acc = marketing_account_repository.get(db, account_id)
        if not acc:
            return None
        return marketing_account_repository.update(db, db_obj=acc, obj_in=data.model_dump(exclude_unset=True))

    def delete_account(self, db: Session, *, account_id: str):
        return marketing_account_repository.remove(db, id=account_id)

    def list_accounts(self, db: Session, *, skip: int = 0, limit: int = 100):
        return marketing_account_repository.get_all(db, skip=skip, limit=limit)

    # Credentials upsert helpers
    def upsert_smtp(self, db: Session, *, account_id: str, data: SmtpCredentialIn):
        cred = smtp_credential_repository.get_by_account(db, account_id)
        payload = data.model_dump(exclude_unset=True)
        # encrypt sensitive
        if "username" in payload and payload["username"] is not None:
            payload["username_enc"] = encrypt_str(payload.pop("username"))
        if "password" in payload and payload["password"] is not None:
            payload["password_enc"] = encrypt_str(payload.pop("password"))
        payload["account_id"] = account_id
        if cred:
            return smtp_credential_repository.update(db, db_obj=cred, obj_in=payload)
        return smtp_credential_repository.create(db, obj_in=payload)

    def upsert_sms(self, db: Session, *, account_id: str, data: SmsCredentialIn):
        cred = sms_credential_repository.get_by_account(db, account_id)
        payload = data.model_dump(exclude_unset=True)
        if "api_key" in payload and payload["api_key"] is not None:
            payload["api_key_enc"] = encrypt_str(payload.pop("api_key"))
        if "client_id" in payload and payload["client_id"] is not None:
            payload["client_id_enc"] = encrypt_str(payload.pop("client_id"))
        if "secret" in payload and payload["secret"] is not None:
            payload["secret_enc"] = encrypt_str(payload.pop("secret"))
        payload["account_id"] = account_id
        if cred:
            return sms_credential_repository.update(db, db_obj=cred, obj_in=payload)
        return sms_credential_repository.create(db, obj_in=payload)

    def upsert_whatsapp(self, db: Session, *, account_id: str, data: WhatsappCredentialIn):
        cred = whatsapp_credential_repository.get_by_account(db, account_id)
        payload = data.model_dump(exclude_unset=True)
        if "api_key" in payload and payload["api_key"] is not None:
            payload["api_key_enc"] = encrypt_str(payload.pop("api_key"))
        if "client_id" in payload and payload["client_id"] is not None:
            payload["client_id_enc"] = encrypt_str(payload.pop("client_id"))
        if "secret" in payload and payload["secret"] is not None:
            payload["secret_enc"] = encrypt_str(payload.pop("secret"))
        payload["account_id"] = account_id
        if cred:
            return whatsapp_credential_repository.update(db, db_obj=cred, obj_in=payload)
        return whatsapp_credential_repository.create(db, obj_in=payload)

    # Credentials getters (safe, without decrypting secrets)
    def get_smtp(self, db: Session, *, account_id: str):
        return smtp_credential_repository.get_by_account(db, account_id)

    def get_sms(self, db: Session, *, account_id: str):
        return sms_credential_repository.get_by_account(db, account_id)

    def get_whatsapp(self, db: Session, *, account_id: str):
        return whatsapp_credential_repository.get_by_account(db, account_id)


marketing_service = MarketingService()


