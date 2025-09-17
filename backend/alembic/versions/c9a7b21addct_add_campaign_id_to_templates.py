"""add campaign_id to templates for per-channel templates

Revision ID: c9a7b21addct
Revises: b7c4d9e1wapp
Create Date: 2025-09-15 13:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c9a7b21addct'
down_revision: Union[str, Sequence[str], None] = 'b7c4d9e1wapp'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('templates') as batch_op:
        batch_op.add_column(sa.Column('campaign_id', sa.UUID(), nullable=True))
        batch_op.create_foreign_key('fk_templates_campaign', 'campaigns', ['campaign_id'], ['id'])


def downgrade() -> None:
    with op.batch_alter_table('templates') as batch_op:
        try:
            batch_op.drop_constraint('fk_templates_campaign', type_='foreignkey')
        except Exception:
            pass
        try:
            batch_op.drop_column('campaign_id')
        except Exception:
            pass



