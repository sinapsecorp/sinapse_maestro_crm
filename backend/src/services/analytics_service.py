from __future__ import annotations

from datetime import datetime, timedelta, date
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import Date, cast, func
from sqlalchemy.orm import Session

from src.models.campaign import Campaign
from src.models.campaign_channel import CampaignChannel
from src.models.channel import Channel
from src.models.campaign_area import CampaignArea
from src.models.area_of_expertise import AreaOfExpertise
from src.models.lead import Lead
from src.models.campaign_lead import CampaignLead, EmailStatus


class AnalyticsService:
    def _parse_dates(self, start_date: Optional[str], end_date: Optional[str]) -> Tuple[datetime, datetime]:
        today: date = datetime.utcnow().date()
        if end_date:
            try:
                end_d: date = datetime.fromisoformat(end_date).date()
            except ValueError:
                end_d = today
        else:
            end_d = today

        if start_date:
            try:
                start_d: date = datetime.fromisoformat(start_date).date()
            except ValueError:
                start_d = end_d - timedelta(days=29)
        else:
            start_d = end_d - timedelta(days=29)

        # intervalo inclusivo [start, end] transformado em [start, end+1d) para facilitar a consulta
        start_dt = datetime.combine(start_d, datetime.min.time())
        end_dt = datetime.combine(end_d + timedelta(days=1), datetime.min.time())
        return start_dt, end_dt

    def _normalize_channel_name(self, name: Optional[str]) -> Optional[str]:
        if not name:
            return None
        n = name.strip().lower()
        n = n.replace('-', '').replace(' ', '')
        return n or None

    def campaigns_sent_count(
        self, db: Session, *, start_date: Optional[str] = None, end_date: Optional[str] = None
    ) -> int:
        start_dt, end_dt = self._parse_dates(start_date, end_date)
        count = (
            db.query(func.count(Campaign.id))
            .filter(
                Campaign.sent_at.isnot(None),
                Campaign.sent_at >= start_dt,
                Campaign.sent_at < end_dt,
            )
            .scalar()
        )
        return int(count or 0)

    def campaigns_by_channel(
        self, db: Session, *, start_date: Optional[str] = None, end_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        start_dt, end_dt = self._parse_dates(start_date, end_date)
        rows = (
            db.query(
                Channel.name.label("channel"),
                func.count(Campaign.id).label("count"),
            )
            .join(CampaignChannel, CampaignChannel.channel_id == Channel.id)
            .join(Campaign, Campaign.id == CampaignChannel.campaign_id)
            .filter(
                Campaign.sent_at.isnot(None),
                Campaign.sent_at >= start_dt,
                Campaign.sent_at < end_dt,
            )
            .group_by(Channel.name)
            .order_by(func.count(Campaign.id).desc())
            .all()
        )
        return [{"channel": r.channel, "count": int(getattr(r, "count", 0) or 0)} for r in rows]

    def campaigns_by_area(
        self, db: Session, *, start_date: Optional[str] = None, end_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        start_dt, end_dt = self._parse_dates(start_date, end_date)
        rows = (
            db.query(
                AreaOfExpertise.name.label("area"),
                func.count(Campaign.id).label("count"),
            )
            .join(CampaignArea, CampaignArea.area_of_expertise_id == AreaOfExpertise.id)
            .join(Campaign, Campaign.id == CampaignArea.campaign_id)
            .filter(
                Campaign.sent_at.isnot(None),
                Campaign.sent_at >= start_dt,
                Campaign.sent_at < end_dt,
            )
            .group_by(AreaOfExpertise.name)
            .order_by(func.count(Campaign.id).desc())
            .all()
        )
        return [{"area": r.area, "count": int(getattr(r, "count", 0) or 0)} for r in rows]

    def campaigns_per_day(
        self, db: Session, *, start_date: Optional[str] = None, end_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        start_dt, end_dt = self._parse_dates(start_date, end_date)
        rows = (
            db.query(
                cast(Campaign.sent_at, Date).label("day"),
                func.count(Campaign.id).label("count"),
            )
            .filter(
                Campaign.sent_at.isnot(None),
                Campaign.sent_at >= start_dt,
                Campaign.sent_at < end_dt,
            )
            .group_by(cast(Campaign.sent_at, Date))
            .order_by(cast(Campaign.sent_at, Date))
            .all()
        )

        # Preencher dias sem dados com zero
        start_day = start_dt.date()
        end_day = (end_dt - timedelta(seconds=1)).date()
        day_to_count = {getattr(r, "day"): int(getattr(r, "count", 0) or 0) for r in rows}
        series: List[Dict[str, Any]] = []
        d = start_day
        while d <= end_day:
            series.append({"date": d.isoformat(), "count": day_to_count.get(d, 0)})
            d += timedelta(days=1)
        return series

    def total_leads(self, db: Session) -> int:
        count = db.query(func.count(Lead.id)).scalar()
        return int(count or 0)

    def delivery_summary_by_channel(
        self, db: Session, *, start_date: Optional[str] = None, end_date: Optional[str] = None, channel_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Retorna estatísticas de entrega por canal.
        Se não houver dados com sent_at, usa dados das campanhas como fallback.
        """
        start_dt, end_dt = self._parse_dates(start_date, end_date)

        # Consulta base para CampaignLead com join na Campaign para usar a data de envio da campanha
        cl_query = db.query(CampaignLead).join(Campaign, Campaign.id == CampaignLead.campaign_id)
        
        norm = self._normalize_channel_name(channel_name)
        if norm:
            normalized_db = func.replace(func.replace(func.lower(Channel.name), '-', ''), ' ', '')
            # incluir envios antigos sem channel_id como e-mail
            if norm == 'email':
                cl_query = (
                    cl_query.outerjoin(Channel, Channel.id == CampaignLead.channel_id)
                    .filter((normalized_db == norm) | (CampaignLead.channel_id.is_(None)))
                )
            else:
                cl_query = cl_query.join(Channel, Channel.id == CampaignLead.channel_id).filter(normalized_db == norm)
        
        # Filtrar por data de envio da campanha OU data de envio do lead (se existir)
        cl_query = cl_query.filter(
            (
                (CampaignLead.sent_at.isnot(None)) & 
                (CampaignLead.sent_at >= start_dt) & 
                (CampaignLead.sent_at < end_dt)
            ) |
            (
                (Campaign.sent_at.isnot(None)) & 
                (Campaign.sent_at >= start_dt) & 
                (Campaign.sent_at < end_dt)
            )
        )

        # Contagem de campanhas únicas
        total_campaigns_query = (
            db.query(func.count(func.distinct(CampaignLead.campaign_id)))
            .select_from(CampaignLead)
            .join(Campaign, Campaign.id == CampaignLead.campaign_id)
            .filter(
                (
                    (CampaignLead.sent_at.isnot(None)) & 
                    (CampaignLead.sent_at >= start_dt) & 
                    (CampaignLead.sent_at < end_dt)
                ) |
                (
                    (Campaign.sent_at.isnot(None)) & 
                    (Campaign.sent_at >= start_dt) & 
                    (Campaign.sent_at < end_dt)
                )
            )
        )
        
        if norm:
            normalized_db2 = func.replace(func.replace(func.lower(Channel.name), '-', ''), ' ', '')
            if norm == 'email':
                total_campaigns_query = (
                    total_campaigns_query.outerjoin(Channel, Channel.id == CampaignLead.channel_id)
                    .filter((normalized_db2 == norm) | (CampaignLead.channel_id.is_(None)))
                )
            else:
                total_campaigns_query = total_campaigns_query.join(Channel, Channel.id == CampaignLead.channel_id).filter(normalized_db2 == norm)
        
        total_campaigns = total_campaigns_query.scalar() or 0

        total_sends = cl_query.count()
        failed_sends = cl_query.filter(CampaignLead.status == EmailStatus.FAILED).count()
        delivered = cl_query.filter(CampaignLead.status.in_([EmailStatus.SENT, EmailStatus.DELIVERED, EmailStatus.OPENED])).count()

        # Se não há dados de entrega, usar fallback baseado apenas nas campanhas
        if total_campaigns == 0 and total_sends == 0:
            fallback_campaigns = (
                db.query(func.count(func.distinct(Campaign.id)))
                .filter(
                    Campaign.sent_at.isnot(None),
                    Campaign.sent_at >= start_dt,
                    Campaign.sent_at < end_dt,
                )
                .scalar() or 0
            )
            
            # Contar campaign_leads sem filtro de data para ver se existem
            all_campaign_leads = (
                db.query(func.count(CampaignLead.id))
                .join(Campaign, Campaign.id == CampaignLead.campaign_id)
                .filter(Campaign.sent_at.isnot(None))
                .scalar() or 0
            )
            
            return {
                "campaigns": int(fallback_campaigns),
                "sends": int(all_campaign_leads),
                "failed": 0,
                "delivered": 0,
            }

        return {
            "campaigns": int(total_campaigns),
            "sends": int(total_sends),
            "failed": int(failed_sends),
            "delivered": int(delivered),
        }

    def delivery_details_by_campaign(
        self, db: Session, *, campaign_id: str, channel_name: Optional[str] = None, skip: int = 0, limit: int = 50
    ) -> Tuple[List[Dict[str, Any]], int]:
        q = (
            db.query(
                CampaignLead.id.label("campaign_lead_id"),
                CampaignLead.status,
                CampaignLead.error_reason,
                Lead.full_name,
                Lead.email,
                Lead.company,
            )
            .join(Lead, Lead.id == CampaignLead.lead_id)
            .filter(CampaignLead.campaign_id == campaign_id)
        )
        norm = self._normalize_channel_name(channel_name)
        if norm:
            normalized_db = func.replace(func.replace(func.lower(Channel.name), '-', ''), ' ', '')
            if norm == 'email':
                q = q.outerjoin(Channel, Channel.id == CampaignLead.channel_id).filter((normalized_db == norm) | (CampaignLead.channel_id.is_(None)))
            else:
                q = q.join(Channel, Channel.id == CampaignLead.channel_id).filter(normalized_db == norm)
        total = q.count()
        rows_data = q.offset(int(skip or 0)).limit(int(limit or 50)).all()
        result: List[Dict[str, Any]] = []
        for r in rows_data:
            result.append({
                "campaign_lead_id": str(getattr(r, "campaign_lead_id")),
                "status": getattr(r, "status").value if getattr(r, "status", None) else None,
                "error_reason": getattr(r, "error_reason", None),
                "full_name": getattr(r, "full_name", None),
                "email": getattr(r, "email", None),
                "company": getattr(r, "company", None),
            })
        return result, int(total)

    def delivery_details_all_leads(
        self, db: Session, *, start_date: Optional[str] = None, end_date: Optional[str] = None, channel_name: Optional[str] = None, skip: int = 0, limit: int = 50
    ) -> Tuple[List[Dict[str, Any]], int]:
        start_dt, end_dt = self._parse_dates(start_date, end_date)
        q = (
            db.query(
                CampaignLead.id.label("campaign_lead_id"),
                CampaignLead.status,
                CampaignLead.error_reason,
                Lead.full_name,
                Lead.email,
                Lead.company,
            )
            .join(Lead, Lead.id == CampaignLead.lead_id)
            .join(Campaign, Campaign.id == CampaignLead.campaign_id)
            .filter(
                (
                    (CampaignLead.sent_at.isnot(None)) & 
                    (CampaignLead.sent_at >= start_dt) & 
                    (CampaignLead.sent_at < end_dt)
                ) |
                (
                    (Campaign.sent_at.isnot(None)) & 
                    (Campaign.sent_at >= start_dt) & 
                    (Campaign.sent_at < end_dt)
                )
            )
        )
        norm = self._normalize_channel_name(channel_name)
        if norm:
            normalized_db = func.replace(func.replace(func.lower(Channel.name), '-', ''), ' ', '')
            if norm == 'email':
                q = q.outerjoin(Channel, Channel.id == CampaignLead.channel_id).filter((normalized_db == norm) | (CampaignLead.channel_id.is_(None)))
            else:
                q = q.join(Channel, Channel.id == CampaignLead.channel_id).filter(normalized_db == norm)
        total = q.count()
        rows_data = q.offset(int(skip or 0)).limit(int(limit or 50)).all()
        result: List[Dict[str, Any]] = []
        for r in rows_data:
            result.append({
                "campaign_lead_id": str(getattr(r, "campaign_lead_id")),
                "status": getattr(r, "status").value if getattr(r, "status", None) else None,
                "error_reason": getattr(r, "error_reason", None),
                "full_name": getattr(r, "full_name", None),
                "email": getattr(r, "email", None),
                "company": getattr(r, "company", None),
            })
        return result, int(total)

    def campaigns_by_status(
        self, db: Session, *, start_date: Optional[str] = None, end_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        from src.models.campaign import CampaignStatus
        
        start_dt, end_dt = self._parse_dates(start_date, end_date)
        
        # Consulta para contar campanhas por status
        rows = (
            db.query(
                Campaign.status.label("status"),
                func.count(Campaign.id).label("count"),
            )
            .filter(
                Campaign.created_at >= start_dt,
                Campaign.created_at < end_dt,
            )
            .group_by(Campaign.status)
            .all()
        )
        
        # Mapear os status para as categorias desejadas
        status_mapping = {
            CampaignStatus.DRAFT: "Pausadas",
            CampaignStatus.SCHEDULED: "Ativas", 
            CampaignStatus.SENT: "Finalizadas",
            CampaignStatus.ARCHIVED: "Finalizadas"
        }
        
        # Agrupar por categoria
        result_dict = {"Ativas": 0, "Pausadas": 0, "Finalizadas": 0}
        for r in rows:
            status = r.status
            count = int(getattr(r, "count", 0) or 0)
            category = status_mapping.get(status, "Outras")
            if category in result_dict:
                result_dict[category] += count
        
        # Converter para lista de dicionários
        return [{"status": k, "count": v} for k, v in result_dict.items()]

    def overview(
        self, db: Session, *, start_date: Optional[str] = None, end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        return {
            "campaigns_sent": self.campaigns_sent_count(db, start_date=start_date, end_date=end_date),
            "campaigns_by_channel": self.campaigns_by_channel(db, start_date=start_date, end_date=end_date),
            "campaigns_by_area": self.campaigns_by_area(db, start_date=start_date, end_date=end_date),
            "campaigns_by_status": self.campaigns_by_status(db, start_date=start_date, end_date=end_date),
            "campaigns_per_day": self.campaigns_per_day(db, start_date=start_date, end_date=end_date),
            "total_leads": self.total_leads(db),
        }


analytics_service = AnalyticsService()


