from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from src.database.session import get_db
from src.repositories.area_of_expertise_repository import area_of_expertise_repository
from src.schemas.area_of_expertise_schemas import AreaOfExpertiseInDB, AreaOfExpertiseCreate, AreaOfExpertiseUpdate

router = APIRouter(
    prefix="/areas-of-expertise",
    tags=["areas-of-expertise"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[AreaOfExpertiseInDB])
def read_areas_of_expertise(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve areas of expertise.
    """
    areas = area_of_expertise_repository.get_all(db, skip=skip, limit=limit)
    return areas


@router.post("/", response_model=AreaOfExpertiseInDB)
def create_area(area_in: AreaOfExpertiseCreate, db: Session = Depends(get_db)):
    return area_of_expertise_repository.create(db, obj_in=area_in.model_dump())


@router.put("/{area_id}", response_model=AreaOfExpertiseInDB)
def update_area(area_id: str, area_in: AreaOfExpertiseUpdate, db: Session = Depends(get_db)):
    db_area = area_of_expertise_repository.get(db, area_id)
    if not db_area:
        raise HTTPException(status_code=404, detail="Area not found")
    return area_of_expertise_repository.update(db, db_obj=db_area, obj_in=area_in.model_dump())


@router.delete("/{area_id}", response_model=AreaOfExpertiseInDB)
def delete_area(area_id: str, db: Session = Depends(get_db)):
    db_area = area_of_expertise_repository.get(db, area_id)
    if not db_area:
        raise HTTPException(status_code=404, detail="Area not found")
    return area_of_expertise_repository.remove(db, id=area_id)
