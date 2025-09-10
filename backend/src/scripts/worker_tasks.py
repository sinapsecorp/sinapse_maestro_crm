from sqlalchemy.orm import Session
from datetime import datetime
from src.database.session import SessionLocal
from src.services.email_service import email_service
from src.repositories.lead_repository import lead_repository
from src.repositories.campaign_repository import campaign_repository
from src.repositories.area_of_expertise_repository import area_of_expertise_repository
from src.models.campaign_lead import CampaignLead, EmailStatus
from src.models.campaign import Campaign
from src.models.lead import Lead
from email_validator import validate_email, EmailNotValidError
import os
import csv
from io import StringIO
import openpyxl
import xlrd
import unicodedata


def import_leads_from_rows(rows: list[dict], user_id: str, default_area_id: str | None = None) -> int:
    db: Session = SessionLocal()
    created = 0
    updated = 0
    skipped = 0
    try:
        total = len(rows)
        # Atualiza meta inicial caso ainda não tenha sido setado
        try:
            from rq import get_current_job
            job = get_current_job()
            if job and not job.meta:
                job.meta = {"progress": 0, "inserted": 0, "updated": 0, "skipped": 0}
                job.save_meta()
        except Exception:
            pass
        for idx, row in enumerate(rows, start=1):
            # Normalizar chaves vindas de XLS onde cabeçalhos podem variar
            def g(*keys):
                for k in keys:
                    v = row.get(k)
                    if v not in (None, ""):
                        return v
                return None

            # Permitir que a área seja nome (string) além de UUID
            area_value = g("area_of_expertise_id", "area", "AreaId", "Area")
            # Se vier um nome de área, buscar o id correspondente
            if area_value and isinstance(area_value, str) and len(area_value) > 20 and '-' in area_value:
                area_id = area_value
            else:
                # tentar por nome
                area = None
                if isinstance(area_value, str) and area_value.strip():
                    area = area_of_expertise_repository.get_by_name(db, name=area_value.strip())
                area_id = str(area.id) if area else area_value

            # telefones: mapear segundo layout e normalizar um principal
            raw_phone = g("phone", "Telefone", "telefone", "Phone", "Telefone Principal", "telefone principal")
            raw_phone2 = g("Telefone Secundário", "telefone secundario", "telefone secund  e1rio")
            def norm_phone(v):
                if v in (None, ""): return None
                digits = ''.join([c for c in str(v) if c.isdigit()])
                if not digits: return None
                if digits.startswith('55') and len(digits) in (12,13):
                    return "+" + digits
                return "+55" + digits
            phone_norm = norm_phone(raw_phone) or norm_phone(raw_phone2)

            company = g("company", "Empresa", "empresa", "Estabelecimentos", "estabelecimentos")
            nome = g("full_name", "name", "nome", "Nome", "Razão Social", "razao social", "Raz e3o Social")

            cnpj = g("CNPJ", "cnpj")
            razao_social = g("Raz e3o Social", "Razao Social", "razao social", "RAZAO SOCIAL")
            if not razao_social:
                razao_social = nome

            data = {
                # obrigatórios do layout
                "cnpj": cnpj,
                "razao_social": razao_social,

                # dados mapeados
                "porte_codigo": g("Porte C f3digo", "Porte Codigo", "Porte C f3digo"),
                "porte": g("Porte"),
                "capital_social": g("Capital Social"),
                "natureza_juridica_codigo": g("Natureza Jur eddica C f3digo", "Natureza Juridica Codigo"),
                "natureza_juridica": g("Natureza Jur eddica", "Natureza Juridica"),
                "ente_federativo_responsavel": g("Ente Federativo Respons elvel", "Ente Federativo Responsavel"),
                "tipo": g("Tipo"),
                "data_abertura": g("Data de Abertura"),
                "nome_fantasia": g("Nome Fantasia"),
                "situacao_cadastral_codigo": g("Situa e7 e3o Cadastral C f3digo", "Situacao Cadastral Codigo"),
                "situacao_cadastral": g("Situa e7 e3o Cadastral", "Situacao Cadastral"),
                "situacao_cadastral_data": g("Situa e7 e3o Cadastral Data", "Situacao Cadastral Data"),
                "situacao_motivo_codigo": g("Situa e7 e3o Motivo C f3digo", "Situacao Motivo Codigo"),
                "situacao_motivo": g("Situa e7 e3o Motivo", "Situacao Motivo"),
                "situacao_especial_codigo": g("Situa e7 e3o Especial C f3digo", "Situacao Especial Codigo"),
                "situacao_especial": g("Situa e7 e3o Especial", "Situacao Especial"),
                "situacao_especial_data": g("Situa e7 e3o Especial Data", "Situacao Especial Data"),
                "telefone_principal": raw_phone,
                "telefone_secundario": raw_phone2,
                "phone": phone_norm,
                "email": g("email", "Email", "E-mail", "e-mail"),
                "municipio_ibge": g("Munic edpio IBGE", "Municipio IBGE"),
                "logradouro": g("Logradouro"),
                "numero": g("N famero", "Numero"),
                "complemento": g("Complemento"),
                "bairro": g("Bairro"),
                "cidade": g("Cidade"),
                "estado": g("Estado"),
                "cep": g("CEP"),
                "pais_codigo": g("Pais C f3digo", "Pais Codigo"),
                "pais": g("Pais", "Pais"),
                "atividade_principal_codigo": g("Atividade Principal C f3digo", "Atividade Principal Codigo"),
                "atividade_principal": g("Atividade Principal"),
                "ultima_atualizacao": g(" daltima Atualiza e7 e3o", "Ultima Atualizacao"),

                # compatibilidade com telas atuais
                "full_name": nome,
                "company": company or nome,
                "job_title": g("job_title", "Cargo", "cargo"),
                "area_of_expertise_id": area_id,
                "user_id": user_id,
            }
            # validar campos mínimos
            if not data["area_of_expertise_id"] and default_area_id:
                data["area_of_expertise_id"] = default_area_id
            # normalizar email
            if isinstance(data["email"], str):
                data["email"] = data["email"].strip()
            # validar email
            # e-mail agora é opcional: validar somente se existir
            if data["email"]:
                try:
                    validate_email(str(data["email"]))
                except EmailNotValidError:
                    data["email"] = None

            # requisitos mínimos: cnpj e razao_social pelo novo layout
            if data["cnpj"] and data["razao_social"] and data["area_of_expertise_id"]:
                # evitar duplicados por email ou por razao_social
                existing = None
                if data["email"]:
                    existing = lead_repository.get_by_email(db, email=str(data["email"]))
                if not existing and data["razao_social"]:
                    # tentar encontrar pelo nome exato
                    q = db.query(Lead).filter(Lead.razao_social.ilike(str(data["razao_social"])) )
                    existing = q.first()
                if existing:
                    # não permitir troca de área automaticamente; apenas atualizar demais campos
                    update_fields = {k: v for k, v in data.items() if k not in ("user_id", "area_of_expertise_id") and v is not None}
                    for k, v in update_fields.items():
                        setattr(existing, k, v)
                    db.add(existing)
                    db.commit()
                    db.refresh(existing)
                    updated += 1
                    # progresso
                    progress = int((idx / total) * 100)
                    from rq import get_current_job
                    job = get_current_job()
                    if job:
                        job.meta.update({"progress": progress, "inserted": created, "updated": updated, "skipped": skipped})
                        job.save_meta()
                    continue
                try:
                    lead_repository.create(db, obj_in=data)
                    created += 1
                except Exception:
                    db.rollback()
                    # upsert: atualizar registro existente
                    existing = lead_repository.get_by_email(db, email=str(data["email"])) if data["email"] else None
                    if existing:
                        update_fields = {k: v for k, v in data.items() if k not in ("user_id", "area_of_expertise_id") and v is not None}
                        for k, v in update_fields.items():
                            setattr(existing, k, v)
                        db.add(existing)
                        db.commit()
                        db.refresh(existing)
                        updated += 1
                        progress = int((idx / total) * 100)
                        from rq import get_current_job
                        job = get_current_job()
                        if job:
                            job.meta.update({"progress": progress, "inserted": created, "updated": updated, "skipped": skipped})
                            job.save_meta()
                        continue
            # progresso regular
            progress = int((idx / total) * 100) if total > 0 else 100
            from rq import get_current_job
            job = get_current_job()
            if job:
                job.meta.update({"progress": progress, "inserted": created, "updated": updated, "skipped": skipped})
                job.save_meta()
        # Finaliza meta com 100%
        try:
            from rq import get_current_job
            job = get_current_job()
            if job:
                job.meta.update({"progress": 100, "inserted": created, "updated": updated, "skipped": skipped})
                job.save_meta()
        except Exception:
            pass
        return created
    finally:
        db.close()


def import_leads_from_file(path: str, user_id: str, default_area_id: str | None = None) -> int:
    # Detectar extensão e converter para rows (dict list)
    ext = os.path.splitext(path)[1].lower()
    rows: list[dict] = []
    # Inicializa meta do job no início da execução
    try:
        from rq import get_current_job
        job = get_current_job()
        if job:
            job.meta.update({"progress": 0, "inserted": 0, "updated": 0, "skipped": 0})
            job.save_meta()
    except Exception:
        pass
    if ext == ".csv":
        with open(path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows = list(reader)
    elif ext == ".xlsx":
        wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
        ws = wb.active
        rows_iter = ws.iter_rows(values_only=True)

        def normalize(s: str) -> str:
            if s is None:
                return ""
            s = str(s)
            s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
            return s.strip().lower()

        header_markers = {"razao social", "nome", "email", "e-mail", "empresa", "estabelecimentos"}
        headers = None
        for row in rows_iter:
            values_norm = [normalize(c) for c in row]
            non_empty_count = sum(1 for v in values_norm if v)
            if non_empty_count >= 3 and any(v in header_markers for v in values_norm):
                headers = [str(c).strip() if c is not None else "" for c in row]
                break
        if headers is None:
            # fallback: primeira linha mesmo
            ws2_iter = ws.iter_rows(values_only=True)
            headers = [str(c).strip() if c is not None else "" for c in next(ws2_iter)]
            for row in ws2_iter:
                rows.append({headers[i]: (row[i] if i < len(row) else None) for i in range(len(headers))})
        else:
            for row in rows_iter:
                rows.append({headers[i]: (row[i] if i < len(row) else None) for i in range(len(headers))})
        wb.close()
    elif ext == ".xls":
        book = xlrd.open_workbook(path)
        sheet = book.sheet_by_index(0)
        def normalize(s: str) -> str:
            if s is None:
                return ""
            s = str(s)
            s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
            return s.strip().lower()
        header_markers = {"razao social", "nome", "email", "e-mail", "empresa", "estabelecimentos"}
        header_row_index = 0
        for r in range(min(10, sheet.nrows)):
            values_norm = [normalize(sheet.cell_value(r, c)) for c in range(sheet.ncols)]
            non_empty_count = sum(1 for v in values_norm if v)
            if non_empty_count >= 3 and any(v in header_markers for v in values_norm):
                header_row_index = r
                break
        headers = [str(sheet.cell_value(header_row_index, col)).strip() for col in range(sheet.ncols)]
        for r in range(header_row_index + 1, sheet.nrows):
            values = [sheet.cell_value(r, c) for c in range(sheet.ncols)]
            rows.append({headers[i]: (values[i] if i < len(values) else None) for i in range(len(headers))})
    # Processar
    return import_leads_from_rows(rows, user_id, default_area_id)


def dispatch_campaign(campaign_id: str, lead_ids: list[str] | None = None, area_of_expertise_ids: list[str] | None = None) -> int:
    db: Session = SessionLocal()
    sent = 0
    try:
        campaign: Campaign | None = campaign_repository.get(db, campaign_id)
        if not campaign:
            return 0
        q = db.query(Lead)
        if lead_ids:
            q = q.filter(Lead.id.in_(lead_ids))
        if area_of_expertise_ids:
            q = q.filter(Lead.area_of_expertise_id.in_(area_of_expertise_ids))
        leads = q.all()
        for lead in leads:
            ok = email_service.send_email(to=lead.email, subject=campaign.subject, body=campaign.body)
            if ok:
                cl = CampaignLead(campaign_id=campaign.id, lead_id=lead.id, status=EmailStatus.SENT, sent_at=datetime.utcnow())
                db.add(cl)
                sent += 1
        db.commit()
        return sent
    finally:
        db.close()


