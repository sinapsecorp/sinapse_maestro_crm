"""expand emailstatus with CLICKED and CONVERTED

Revision ID: track_click_convert_status
Revises: e1f2g3h4
Create Date: 2025-09-16 11:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'track_click_convert_status'
down_revision: Union[str, Sequence[str], None] = 'e1f2g3h4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    try:
        # PostgreSQL supports ALTER TYPE ADD VALUE
        op.execute("ALTER TYPE emailstatus ADD VALUE IF NOT EXISTS 'CLICKED'")
        op.execute("ALTER TYPE emailstatus ADD VALUE IF NOT EXISTS 'CONVERTED'")
    except Exception:
        # fallback: attempt batch alter
        try:
            with op.batch_alter_table('campaign_leads') as batch_op:
                batch_op.alter_column(
                    'status',
                    type_=sa.Enum('PENDING','SENT','FAILED','DELIVERED','OPENED','CLICKED','CONVERTED', name='emailstatus'),
                    existing_type=sa.Enum('PENDING','SENT','FAILED','DELIVERED','OPENED', name='emailstatus')
                )
        except Exception:
            pass


def downgrade() -> None:
    # Downgrade of enum values is non-trivial; no-op to avoid data loss
    pass


