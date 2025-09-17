from sqlalchemy.orm import Session
from typing import List
from src.repositories.campaign_repository import campaign_repository
from src.repositories.channel_repository import channel_repository
from src.repositories.area_of_expertise_repository import area_of_expertise_repository
from src.schemas.campaign_schemas import CampaignCreate, CampaignUpdate
from src.models.campaign import Campaign, CampaignStatus
from src.models.template import Template
from src.models.template_attachment import TemplateAttachment
from src.models.campaign_lead import CampaignLead


class CampaignService:
    def create_campaign(self, db: Session, *, campaign_in: CampaignCreate, user_id: str) -> Campaign:
        payload = campaign_in.model_dump(by_alias=True)
        title = payload.get("title")
        subject = payload.get("subject")
        body = payload.get("body")
        channel_ids = payload.get("channel_ids") or []
        area_ids = payload.get("area_ids") or []
        template_data = payload.get("template")
        templates_data = payload.get("templates") or []
        objective = payload.get("objective")
        marketing_account_id = payload.get("marketing_account_id")

        # validações
        if not title:
            raise ValueError("title é obrigatório")
        if not channel_ids:
            raise ValueError("pelo menos um canal é obrigatório")

        # Derivar corpo a partir do template se não vier explícito
        if (not body) and template_data and template_data.get("content"):
            body = template_data.get("content")
        if body is None:
            body = ""

        # cria campaign básica (compat: armazenar title em name; body/subject diretos)
        campaign = campaign_repository.create(db, obj_in={
            "name": title,
            "subject": subject,
            "body": body,
            "user_id": user_id,
            "objective": objective,
            "marketing_account_id": marketing_account_id,
        })

        # templates (um geral + específicos por canal)
        created_default_tpl = None
        if template_data and (template_data.get("subject") or template_data.get("content")):
            created_default_tpl = Template(
                subject=template_data.get("subject") or subject,
                content=template_data.get("content") or body,
                campaign_id=campaign.id,
                channel_id=None,
            )
            db.add(created_default_tpl)
            db.flush()
            campaign.template_id = created_default_tpl.id

        for t in templates_data:
            if not (t.get("subject") or t.get("content") or t.get("channel_id")):
                continue
            tpl = Template(
                subject=t.get("subject") or subject,
                content=t.get("content") or body,
                campaign_id=campaign.id,
                channel_id=t.get("channel_id"),
            )
            db.add(tpl)
            db.flush()
            # attachments (opcionais)
            for a in (t.get("attachments") or []):
                if not a.get("file_url"):
                    continue
                att = TemplateAttachment(
                    template_id=tpl.id,
                    file_name=a.get("file_name") or a.get("name") or "arquivo",
                    file_url=a.get("file_url") or a.get("url"),
                    content_type=a.get("content_type"),
                )
                db.add(att)

        # relacionar channels
        if channel_ids:
            # valida ids existentes
            channels = [channel_repository.get(db, cid) for cid in channel_ids]
            campaign.channels = [c for c in channels if c is not None]

        # relacionar areas (opcional)
        if area_ids is not None:
            areas = [area_of_expertise_repository.get(db, aid) for aid in (area_ids or [])]
            campaign.areas = [a for a in areas if a is not None]

        db.add(campaign)
        db.commit()
        db.refresh(campaign)
        return campaign

    def update_campaign(self, db: Session, *, campaign_id: str, campaign_in: CampaignUpdate) -> Campaign:
        campaign = campaign_repository.get(db, campaign_id)
        if not campaign:
            return None  # type: ignore
        payload = campaign_in.model_dump(exclude_unset=True)
        # atualizar campos simples
        if "title" in payload:
            campaign.name = payload["title"] or campaign.name
        if "subject" in payload:
            campaign.subject = payload["subject"] or campaign.subject
        if "body" in payload:
            campaign.body = payload["body"] or campaign.body
        if "status" in payload and payload["status"] is not None:
            campaign.status = payload["status"]
        if "objective" in payload:
            campaign.objective = payload.get("objective")
        if "marketing_account_id" in payload:
            campaign.marketing_account_id = payload.get("marketing_account_id")

        # atualizar template
        if "template" in payload and payload["template"]:
            t = payload["template"]
            if campaign.template_id:
                tpl = db.query(Template).get(campaign.template_id)
                if tpl:
                    tpl.subject = t.get("subject", tpl.subject)
                    tpl.content = t.get("content", tpl.content)
            else:
                tpl = Template(subject=t.get("subject") or campaign.subject, content=t.get("content") or campaign.body, campaign_id=campaign.id)
                db.add(tpl)
                db.commit()
                db.refresh(tpl)
                campaign.template_id = tpl.id

        # atualizar/definir templates específicos por canal
        if "templates" in payload and payload["templates"] is not None:
            # Estratégia simples: remover existentes por canal e recriar a partir do payload
            existing = db.query(Template).filter(Template.campaign_id == campaign.id, Template.channel_id.isnot(None)).all()
            for e in existing:
                # cascata remove attachments
                db.delete(e)
            for t in (payload["templates"] or []):
                if not (t.get("subject") or t.get("content") or t.get("channel_id")):
                    continue
                tpl = Template(
                    subject=t.get("subject") or campaign.subject,
                    content=t.get("content") or campaign.body,
                    campaign_id=campaign.id,
                    channel_id=t.get("channel_id"),
                )
                db.add(tpl)
                db.flush()
                for a in (t.get("attachments") or []):
                    if not a.get("file_url"):
                        continue
                    att = TemplateAttachment(
                        template_id=tpl.id,
                        file_name=a.get("file_name") or a.get("name") or "arquivo",
                        file_url=a.get("file_url") or a.get("url"),
                        content_type=a.get("content_type"),
                    )
                    db.add(att)

        # atualizar relacionamentos
        if "channel_ids" in payload and payload["channel_ids"] is not None:
            channels = [channel_repository.get(db, cid) for cid in (payload["channel_ids"] or [])]
            campaign.channels = [c for c in channels if c is not None]
        if "area_ids" in payload and payload["area_ids"] is not None:
            areas = [area_of_expertise_repository.get(db, aid) for aid in (payload["area_ids"] or [])]
            campaign.areas = [a for a in areas if a is not None]

        db.add(campaign)
        db.commit()
        db.refresh(campaign)
        return campaign

    def delete_campaign(self, db: Session, *, campaign_id: str) -> Campaign:
        # Excluir registros de entrega (campaign_leads) e arquivar a campanha
        campaign = campaign_repository.get(db, campaign_id)
        if not campaign:
            return None  # type: ignore

        # Remover dados de relatórios de entrega
        try:
            db.query(CampaignLead).filter(CampaignLead.campaign_id == campaign.id).delete(synchronize_session=False)
        except Exception:
            pass

        # Garantir que não conte em relatórios que usam sent_at como fallback
        campaign.sent_at = None
        campaign.status = CampaignStatus.ARCHIVED

        db.add(campaign)
        db.commit()
        db.refresh(campaign)
        return campaign

    def get_campaigns(self, db: Session, *, skip: int = 0, limit: int = 100, q: str | None = None, status: str | None = None) -> List[Campaign]:
        return campaign_repository.get_all_filtered(db, skip=skip, limit=limit, q=q, status=status)

    def get_campaign(self, db: Session, *, campaign_id: str) -> Campaign | None:
        return campaign_repository.get(db, campaign_id)

    def duplicate_campaign(self, db: Session, *, campaign_id: str, user_id: str) -> Campaign | None:
        """Cria uma cópia da campanha com seus relacionamentos (canais, áreas e templates)."""
        orig = campaign_repository.get(db, campaign_id)
        if not orig:
            return None  # type: ignore
        # cria nova base
        new_campaign = campaign_repository.create(db, obj_in={
            "name": f"{getattr(orig, 'name', 'Campanha')} (cópia)",
            "subject": getattr(orig, 'subject', ''),
            "body": getattr(orig, 'body', ''),
            "user_id": user_id,
        })
        # relacionamentos: canais e áreas
        try:
            new_campaign.channels = list(getattr(orig, 'channels', []) or [])
            new_campaign.areas = list(getattr(orig, 'areas', []) or [])
        except Exception:
            pass
        db.add(new_campaign)
        db.commit()
        db.refresh(new_campaign)
        # templates
        default_tpl_id = None
        for t in getattr(orig, 'templates', []) or []:
            tpl = Template(subject=getattr(t, 'subject', ''), content=getattr(t, 'content', ''), campaign_id=new_campaign.id, channel_id=getattr(t, 'channel_id', None))
            db.add(tpl)
            db.commit()
            db.refresh(tpl)
            if getattr(t, 'channel_id', None) is None:
                default_tpl_id = tpl.id
        if default_tpl_id:
            new_campaign.template_id = default_tpl_id
            db.add(new_campaign)
            db.commit()
            db.refresh(new_campaign)
        return new_campaign

campaign_service = CampaignService()
