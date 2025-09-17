from fastapi import APIRouter, Depends, UploadFile, File, Response, HTTPException, Form
from sqlalchemy.orm import Session
from src.database.session import get_db
from src.schemas.lead_schemas import LeadCreate, LeadInDB, LeadUpdate, LeadBulkDeleteByAreasRequest, LeadBulkDeleteResult
from src.services.lead_service import lead_service
from src.utils.security import get_current_user
from src.models.user import User
from src.utils.queue import get_queue, get_redis_connection
from rq.job import Job
from src.scripts.worker_tasks import import_leads_from_rows
import csv
from io import StringIO
import tempfile
import os
from typing import List, Dict
from src.utils.pagination import normalize_pagination
import openpyxl
import xlrd

router = APIRouter()

@router.get("/", response_model=list[LeadInDB])
def read_leads(
    response: Response,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    page: int | None = None,
    page_size: int | None = None,
    q: str | None = None,
    f: str | None = None,
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve leads.
    """
    s, l = normalize_pagination(page=page, page_size=page_size, skip=skip, limit=limit)
    if q or f:
        leads = lead_service.search_and_filter(db, query=q, filter_key=f, skip=s, limit=l)
        total = lead_service.count_search_and_filter(db, query=q, filter_key=f)
    else:
        leads = lead_service.get_leads(db, skip=s, limit=l)
        total = lead_service.get_total_count(db)
    response.headers["X-Total-Count"] = str(total)
    return leads

@router.post("/", response_model=LeadInDB)
def create_lead(
    *,
    db: Session = Depends(get_db),
    lead_in: LeadCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create new lead.
    """
    lead = lead_service.create_lead(db, lead_in=lead_in, user_id=current_user.id)
    return lead

@router.put("/{lead_id}", response_model=LeadInDB)
def update_lead(
    *,
    db: Session = Depends(get_db),
    lead_id: str,
    lead_in: LeadUpdate,
    current_user: User = Depends(get_current_user),
):
    lead = lead_service.update_lead(db, lead_id=lead_id, lead_in=lead_in)
    return lead

@router.delete("/{lead_id}", response_model=LeadInDB)
def delete_lead(
    *,
    db: Session = Depends(get_db),
    lead_id: str,
    current_user: User = Depends(get_current_user),
):
    lead = lead_service.delete_lead(db, lead_id=lead_id)
    return lead

@router.post("/import")
def import_leads(
    *,
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
    area_of_expertise_id: str | None = Form(None),
    current_user: User = Depends(get_current_user),
):
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".csv", ".xlsx", ".xls"]:
        raise HTTPException(status_code=400, detail="Formato de arquivo não suportado. Envie CSV, XLSX ou XLS.")

    # Salvar arquivo em diretório compartilhado com o worker
    uploads_dir = "/app/uploads"
    os.makedirs(uploads_dir, exist_ok=True)
    unique_name = f"import_{current_user.id}_{os.getpid()}_{filename}"
    save_path = os.path.join(uploads_dir, unique_name)
    with open(save_path, "wb") as out:
        out.write(file.file.read())

    # Estimar total de linhas
    total: int | None = None
    try:
        if ext == ".csv":
            with open(save_path, "rb") as f:
                total = sum(1 for _ in f) - 1
        elif ext == ".xlsx":
            # Em read_only, max_row pode ser None enquanto a planilha é "unsized".
            # Usamos iter_rows para contar linhas de dados (ignorando cabeçalho).
            wb = openpyxl.load_workbook(save_path, read_only=True, data_only=True)
            ws = wb.active
            # Conta linhas não vazias a partir da segunda linha (estimativa)
            total = sum(1 for _ in ws.iter_rows(min_row=2, values_only=True))
            wb.close()
        elif ext == ".xls":
            book = xlrd.open_workbook(save_path)
            sheet = book.sheet_by_index(0)
            total = max(0, sheet.nrows - 1)
    except Exception:
        total = None

    q = get_queue()
    job = q.enqueue("src.scripts.worker_tasks.import_leads_from_file", save_path, str(current_user.id), area_of_expertise_id)
    return {"job_id": job.id, "total": total}


@router.get("/import/status")
def import_status(job_id: str):
    conn = get_redis_connection()
    job = Job.fetch(job_id, connection=conn)
    meta = job.meta or {}
    return {
        "job_id": job_id,
        "status": job.get_status(),
        "meta": meta,
    }


@router.post("/bulk-delete/by-areas", response_model=LeadBulkDeleteResult)
def bulk_delete_by_areas(
    *,
    db: Session = Depends(get_db),
    payload: LeadBulkDeleteByAreasRequest,
    current_user: User = Depends(get_current_user),
):
    deleted = lead_service.bulk_delete_by_areas(db, area_ids=[str(x) for x in payload.area_of_expertise_ids])
    return {"deleted": deleted}


@router.get("/stats")
def lead_stats(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return lead_service.stats(db)
