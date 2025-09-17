from sqlalchemy.orm import Session
from src.repositories.base_repository import BaseRepository
from src.models.marketing_account import MarketingAccount
from src.models.credentials import SmtpCredential, SmsCredential, WhatsappCredential


class MarketingAccountRepository(BaseRepository[MarketingAccount]):
    def __init__(self) -> None:
        super().__init__(MarketingAccount)

    def get_by_name(self, db: Session, *, name: str) -> MarketingAccount | None:
        return db.query(MarketingAccount).filter(MarketingAccount.name == name).first()


marketing_account_repository = MarketingAccountRepository()


class SmtpCredentialRepository(BaseRepository[SmtpCredential]):
    def __init__(self) -> None:
        super().__init__(SmtpCredential)

    def get_by_account(self, db: Session, account_id: str) -> SmtpCredential | None:
        return db.query(SmtpCredential).filter(SmtpCredential.account_id == account_id).first()


smtp_credential_repository = SmtpCredentialRepository()


class SmsCredentialRepository(BaseRepository[SmsCredential]):
    def __init__(self) -> None:
        super().__init__(SmsCredential)

    def get_by_account(self, db: Session, account_id: str) -> SmsCredential | None:
        return db.query(SmsCredential).filter(SmsCredential.account_id == account_id).first()


sms_credential_repository = SmsCredentialRepository()


class WhatsappCredentialRepository(BaseRepository[WhatsappCredential]):
    def __init__(self) -> None:
        super().__init__(WhatsappCredential)

    def get_by_account(self, db: Session, account_id: str) -> WhatsappCredential | None:
        return db.query(WhatsappCredential).filter(WhatsappCredential.account_id == account_id).first()


whatsapp_credential_repository = WhatsappCredentialRepository()


