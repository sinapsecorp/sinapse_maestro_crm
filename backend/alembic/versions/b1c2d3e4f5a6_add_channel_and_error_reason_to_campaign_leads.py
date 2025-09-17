"""add channel_id and error_reason to campaign_leads

Revision ID: b1c2d3e4f5a6
Revises: a3e1f1c2c3d4
Create Date: 2025-09-15 00:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b1c2d3e4f5a6'
down_revision: Union[str, Sequence[str], None] = 'a3e1f1c2c3d4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('campaign_leads') as batch_op:
        try:
            batch_op.add_column(sa.Column('channel_id', sa.UUID(), nullable=True))
        except Exception:
            pass
        try:
            batch_op.add_column(sa.Column('error_reason', sa.String(), nullable=True))
        except Exception:
            pass
    try:
        op.create_foreign_key(
            'fk_campaign_leads_channel',
            'campaign_leads',
            'channels',
            ['channel_id'],
            ['id'],
            ondelete='SET NULL'
        )
    except Exception:
        pass


def downgrade() -> None:
    try:
        op.drop_constraint('fk_campaign_leads_channel', 'campaign_leads', type_='foreignkey')
    except Exception:
        pass
    with op.batch_alter_table('campaign_leads') as batch_op:
        try:
            batch_op.drop_column('error_reason')
        except Exception:
            pass
        try:
            batch_op.drop_column('channel_id')
        except Exception:
            pass




