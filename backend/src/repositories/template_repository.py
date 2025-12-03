from sqlalchemy.orm import Session
from src.repositories.base_repository import BaseRepository
from src.models.template import Template


class TemplateRepository(BaseRepository[Template]):
    def __init__(self):
        super().__init__(Template)


template_repository = TemplateRepository()














