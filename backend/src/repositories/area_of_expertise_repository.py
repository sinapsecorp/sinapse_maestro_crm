from src.repositories.base_repository import BaseRepository
from src.models.area_of_expertise import AreaOfExpertise
from sqlalchemy.orm import Session

class AreaOfExpertiseRepository(BaseRepository[AreaOfExpertise]):
    def __init__(self):
        super().__init__(AreaOfExpertise)

    def get_by_name(self, db: Session, name: str) -> AreaOfExpertise | None:
        return db.query(AreaOfExpertise).filter(AreaOfExpertise.name.ilike(name)).first()

area_of_expertise_repository = AreaOfExpertiseRepository()
