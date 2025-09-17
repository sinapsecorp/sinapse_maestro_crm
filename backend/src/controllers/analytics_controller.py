from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from typing import Optional

from src.database.session import get_db
from src.utils.security import get_current_user
from src.models.user import User
from src.services.analytics_service import analytics_service


router = APIRouter()


@router.get("/overview")
def overview(
    *,
    db: Session = Depends(get_db),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    return analytics_service.overview(db, start_date=start_date, end_date=end_date)


@router.get("/campaigns/sent/count")
def campaigns_sent_count(
    *,
    db: Session = Depends(get_db),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    return {"count": analytics_service.campaigns_sent_count(db, start_date=start_date, end_date=end_date)}


@router.get("/campaigns/by-channel")
def campaigns_by_channel(
    *,
    db: Session = Depends(get_db),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    return analytics_service.campaigns_by_channel(db, start_date=start_date, end_date=end_date)


@router.get("/campaigns/by-area")
def campaigns_by_area(
    *,
    db: Session = Depends(get_db),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    return analytics_service.campaigns_by_area(db, start_date=start_date, end_date=end_date)


@router.get("/campaigns/by-status")
def campaigns_by_status(
    *,
    db: Session = Depends(get_db),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    return analytics_service.campaigns_by_status(db, start_date=start_date, end_date=end_date)


@router.get("/campaigns/per-day")
def campaigns_per_day(
    *,
    db: Session = Depends(get_db),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    return analytics_service.campaigns_per_day(db, start_date=start_date, end_date=end_date)


@router.get("/leads/total")
def total_leads(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {"count": analytics_service.total_leads(db)}


@router.get("/delivery/summary")
def delivery_summary(
    *,
    db: Session = Depends(get_db),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    channel: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    return analytics_service.delivery_summary_by_channel(db, start_date=start_date, end_date=end_date, channel_name=channel)


@router.get("/delivery/campaign/{campaign_id}")
def delivery_details_by_campaign(
    *,
    response: Response,
    db: Session = Depends(get_db),
    campaign_id: str,
    channel: Optional[str] = None,
    page: int | None = None,
    page_size: int | None = None,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
):
    from src.utils.pagination import normalize_pagination
    s, l = normalize_pagination(page=page, page_size=page_size, skip=skip, limit=limit)
    items, total = analytics_service.delivery_details_by_campaign(db, campaign_id=campaign_id, channel_name=channel, skip=s, limit=l)
    response.headers["X-Total-Count"] = str(total)
    return items


@router.get("/delivery/leads")
def delivery_details_all_leads(
    *,
    response: Response,
    db: Session = Depends(get_db),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    channel: Optional[str] = None,
    page: int | None = None,
    page_size: int | None = None,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
):
    from src.utils.pagination import normalize_pagination
    s, l = normalize_pagination(page=page, page_size=page_size, skip=skip, limit=limit)
    items, total = analytics_service.delivery_details_all_leads(db, start_date=start_date, end_date=end_date, channel_name=channel, skip=s, limit=l)
    response.headers["X-Total-Count"] = str(total)
    return items


