import uuid
from sqlalchemy import Column, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from src.database.base import Base


class CampaignArea(Base):
    __tablename__ = "campaign_areas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False)
    area_of_expertise_id = Column(UUID(as_uuid=True), ForeignKey("areas_of_expertise.id", ondelete="RESTRICT"), nullable=False)

    __table_args__ = (
        UniqueConstraint('campaign_id', 'area_of_expertise_id', name='uq_campaign_area'),
    )



