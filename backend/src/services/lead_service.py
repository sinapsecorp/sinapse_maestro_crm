from sqlalchemy.orm import Session
from fastapi import UploadFile
import csv
from io import StringIO
from src.repositories.lead_repository import lead_repository
from src.schemas.lead_schemas import LeadCreate, LeadUpdate
from src.models.lead import Lead

class LeadService:
    def create_lead(self, db: Session, *, lead_in: LeadCreate, user_id: str) -> Lead:
        lead_data = lead_in.model_dump()
        lead_data["user_id"] = user_id
        return lead_repository.create(db, obj_in=lead_data)

    def get_leads(self, db: Session, *, skip: int = 0, limit: int = 100) -> list[Lead]:
        return lead_repository.get_all(db, skip=skip, limit=limit)

    def get_total_count(self, db: Session) -> int:
        return lead_repository.count_all(db)

    def search(self, db: Session, *, query: str, skip: int = 0, limit: int = 100) -> list[Lead]:
        return lead_repository.search(db, query=query, skip=skip, limit=limit)

    def count_search(self, db: Session, *, query: str) -> int:
        return lead_repository.count_search(db, query=query)

    def search_and_filter(self, db: Session, *, query: str | None, filter_key: str | None, skip: int = 0, limit: int = 100) -> list[Lead]:
        return lead_repository.search_and_filter(db, query=query, filter_key=filter_key, skip=skip, limit=limit)

    def count_search_and_filter(self, db: Session, *, query: str | None, filter_key: str | None) -> int:
        return lead_repository.count_search_and_filter(db, query=query, filter_key=filter_key)

    def update_lead(self, db: Session, *, lead_id: str, lead_in: LeadUpdate) -> Lead:
        lead = lead_repository.get(db, lead_id)
        update_data = lead_in.model_dump(exclude_unset=True)
        return lead_repository.update(db, db_obj=lead, obj_in=update_data)

    def delete_lead(self, db: Session, *, lead_id: str) -> Lead:
        return lead_repository.remove(db, id=lead_id)

    def bulk_delete_by_areas(self, db: Session, *, area_ids: list[str]) -> int:
        return lead_repository.bulk_delete_by_areas(db, area_ids=area_ids)

    def stats(self, db: Session) -> dict:
        return lead_repository.stats(db)

    def import_csv(self, db: Session, *, file: UploadFile, user_id: str) -> int:
        content = file.file.read().decode("utf-8")
        reader = csv.DictReader(StringIO(content))
        created = 0
        for row in reader:
            data = {
                "full_name": row.get("full_name") or row.get("name"),
                "email": row.get("email"),
                "phone": row.get("phone"),
                "company": row.get("company"),
                "job_title": row.get("job_title"),
                "area_of_expertise_id": row.get("area_of_expertise_id"),
                "user_id": user_id,
            }
            if data["full_name"] and data["email"] and data["area_of_expertise_id"]:
                lead_repository.create(db, obj_in=data)
                created += 1
        return created

lead_service = LeadService()
