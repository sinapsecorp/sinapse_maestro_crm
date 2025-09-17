import uuid
from sqlalchemy import Column, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from src.database.base import Base


class CampaignChannel(Base):
    __tablename__ = "campaign_channels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False)
    channel_id = Column(UUID(as_uuid=True), ForeignKey("channels.id", ondelete="RESTRICT"), nullable=False)

    __table_args__ = (
        UniqueConstraint('campaign_id', 'channel_id', name='uq_campaign_channel'),
    )



