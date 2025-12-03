"""change templates.content to Text

Revision ID: 20250918_change_template_content_to_text
Revises: add_template_attachments
Create Date: 2025-09-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'tpltxt_20250918'
down_revision: Union[str, Sequence[str], None] = '84d10a501999'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    try:
        op.alter_column(
            'templates',
            'content',
            existing_type=sa.String(),
            type_=sa.Text(),
            existing_nullable=False,
            postgresql_using='content::text',
        )
    except Exception:
        # Fallback caso o dialect não suporte USING
        try:
            op.execute('ALTER TABLE templates ALTER COLUMN content TYPE TEXT')
        except Exception:
            pass


def downgrade() -> None:
    try:
        op.alter_column(
            'templates',
            'content',
            existing_type=sa.Text(),
            type_=sa.String(),
            existing_nullable=False,
        )
    except Exception:
        try:
            op.execute('ALTER TABLE templates ALTER COLUMN content TYPE VARCHAR')
        except Exception:
            pass


