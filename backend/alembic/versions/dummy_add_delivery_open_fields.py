"""add delivery and open tracking fields

Revision ID: track_email_events
Revises: c9a7b21addct
Create Date: 2025-09-15 19:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'track_email_events'
down_revision: Union[str, Sequence[str], None] = 'c9a7b21addct'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('campaign_leads') as batch_op:
        try:
            batch_op.add_column(sa.Column('delivered_at', sa.DateTime(), nullable=True))
        except Exception:
            pass
        try:
            batch_op.add_column(sa.Column('opened_at', sa.DateTime(), nullable=True))
        except Exception:
            pass
        try:
            batch_op.alter_column(
                'status',
                type_=sa.Enum('PENDING','SENT','FAILED','DELIVERED','OPENED','CLICKED','CONVERTED', name='emailstatus'),
                existing_type=sa.Enum('PENDING','SENT','FAILED', name='emailstatus')
            )
        except Exception:
            pass


def downgrade() -> None:
    with op.batch_alter_table('campaign_leads') as batch_op:
        try:
            batch_op.drop_column('delivered_at')
        except Exception:
            pass
        try:
            batch_op.drop_column('opened_at')
        except Exception:
            pass


