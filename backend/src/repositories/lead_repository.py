from src.repositories.base_repository import BaseRepository
from src.models.lead import Lead
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List

class LeadRepository(BaseRepository[Lead]):
    def __init__(self):
        super().__init__(Lead)

    def search(self, db: Session, *, query: str, skip: int = 0, limit: int = 100) -> list[Lead]:
        like = f"%{query}%"
        return (
            db.query(Lead)
            .filter(
                (Lead.full_name.ilike(like))
                | (Lead.email.ilike(like))
                | (Lead.company.ilike(like))
                | (Lead.cnpj.ilike(like))
                | (Lead.razao_social.ilike(like))
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count_search(self, db: Session, *, query: str) -> int:
        like = f"%{query}%"
        return (
            db.query(Lead)
            .filter(
                (Lead.full_name.ilike(like))
                | (Lead.email.ilike(like))
                | (Lead.company.ilike(like))
                | (Lead.cnpj.ilike(like))
                | (Lead.razao_social.ilike(like))
            )
            .count()
        )

    def stats(self, db: Session) -> dict:
        total_with_email = db.query(Lead).filter(Lead.email.isnot(None)).count()
        total_with_phone = db.query(Lead).filter((Lead.phone.isnot(None)) | (Lead.telefone_principal.isnot(None)) | (Lead.telefone_secundario.isnot(None))).count()
        total_without_both = db.query(Lead).filter(Lead.email.is_(None), (Lead.phone.is_(None)) & (Lead.telefone_principal.is_(None)) & (Lead.telefone_secundario.is_(None))).count()
        useful = db.query(Lead).filter((Lead.email.isnot(None)) | (Lead.phone.isnot(None)) | (Lead.telefone_principal.isnot(None)) | (Lead.telefone_secundario.isnot(None))).count()
        return {
            "with_email": total_with_email,
            "with_phone": total_with_phone,
            "without_email_phone": total_without_both,
            "useful": useful,
        }

    def _filter_expression(self, filter_key: str):
        phone_cond = or_(Lead.phone.isnot(None), Lead.telefone_principal.isnot(None), Lead.telefone_secundario.isnot(None))
        if filter_key == "with_email":
            return Lead.email.isnot(None)
        if filter_key == "with_phone":
            return phone_cond
        if filter_key == "without_email_phone":
            return and_(Lead.email.is_(None), Lead.phone.is_(None), Lead.telefone_principal.is_(None), Lead.telefone_secundario.is_(None))
        if filter_key == "useful":
            return or_(Lead.email.isnot(None), phone_cond)
        return None

    def search_and_filter(self, db: Session, *, query: str | None, filter_key: str | None, skip: int, limit: int) -> list[Lead]:
        q = db.query(Lead)
        if filter_key:
            expr = self._filter_expression(filter_key)
            if expr is not None:
                q = q.filter(expr)
        if query:
            like = f"%{query}%"
            q = q.filter(
                or_(
                    Lead.full_name.ilike(like),
                    Lead.email.ilike(like),
                    Lead.company.ilike(like),
                    Lead.cnpj.ilike(like),
                    Lead.razao_social.ilike(like),
                )
            )
        return q.offset(skip).limit(limit).all()

    def count_search_and_filter(self, db: Session, *, query: str | None, filter_key: str | None) -> int:
        q = db.query(Lead)
        if filter_key:
            expr = self._filter_expression(filter_key)
            if expr is not None:
                q = q.filter(expr)
        if query:
            like = f"%{query}%"
            q = q.filter(
                or_(
                    Lead.full_name.ilike(like),
                    Lead.email.ilike(like),
                    Lead.company.ilike(like),
                    Lead.cnpj.ilike(like),
                    Lead.razao_social.ilike(like),
                )
            )
        return q.count()

    def bulk_delete_by_areas(self, db: Session, *, area_ids: List[str]) -> int:
        q = db.query(Lead).filter(Lead.area_of_expertise_id.in_(area_ids))
        deleted = q.delete(synchronize_session=False)
        db.commit()
        return deleted

    def get_by_email(self, db: Session, *, email: str) -> Lead | None:
        return db.query(Lead).filter(Lead.email == email).first()

    def get_by_cnpj(self, db: Session, *, cnpj: str) -> Lead | None:
        return db.query(Lead).filter(Lead.cnpj == cnpj).first()

    # get_all and count_all already exist in BaseRepository and retornam todos

lead_repository = LeadRepository()
