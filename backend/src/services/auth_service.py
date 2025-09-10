from datetime import timedelta
from sqlalchemy.orm import Session
from src.models.user import User
from src.repositories.user_repository import user_repository
from src.schemas.auth_schemas import UserCreate
from src.utils.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_password_hash,
    verify_password,
)


class AuthService:
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return verify_password(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return get_password_hash(password)

    def create_access_token(self, data: dict) -> str:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        return create_access_token(data, expires_delta=expires_delta)

    def create_user(self, db: Session, user_in: UserCreate) -> User:
        hashed_password = self.get_password_hash(user_in.password)
        user_data = user_in.model_dump()
        user_data["password_hash"] = hashed_password
        del user_data["password"]
        return user_repository.create(db, obj_in=user_data)


auth_service = AuthService()
