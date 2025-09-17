from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from src.database.session import get_db
from src.models.channel import Channel
from src.repositories.channel_repository import channel_repository


router = APIRouter()


@router.get("/", response_model=List[dict])
def list_channels(db: Session = Depends(get_db)):
    items = channel_repository.get_all(db)
    return [{"id": str(i.id), "name": i.name} for i in items]



