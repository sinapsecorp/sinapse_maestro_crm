from sqlalchemy.orm import Session
from src.repositories.base_repository import BaseRepository
from src.models.user import User

class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

    def get_by_email(self, db: Session, *, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()

user_repository = UserRepository()
