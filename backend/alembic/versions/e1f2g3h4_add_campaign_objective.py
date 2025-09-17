"""add campaign objective column

Revision ID: e1f2g3h4
Revises: track_email_events
Create Date: 2025-09-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e1f2g3h4'
down_revision: Union[str, Sequence[str], None] = 'track_email_events'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    try:
        objective_enum = sa.Enum(
            'LEAD_GENERATION',
            'BRAND_AWARENESS',
            'PRODUCT_PROMOTION',
            'CSAT',
            name='campaignobjective'
        )
        objective_enum.create(op.get_bind(), checkfirst=True)
    except Exception:
        pass

    try:
        with op.batch_alter_table('campaigns') as batch_op:
            batch_op.add_column(sa.Column('objective', objective_enum, nullable=True))
    except Exception:
        pass


def downgrade() -> None:
    try:
        with op.batch_alter_table('campaigns') as batch_op:
            try:
                batch_op.drop_column('objective')
            except Exception:
                pass
    finally:
        # Drop enum type if exists (PostgreSQL)
        try:
            op.execute("DROP TYPE IF EXISTS campaignobjective")
        except Exception:
            pass


