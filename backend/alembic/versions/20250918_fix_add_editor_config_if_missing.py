"""ensure editor_config column exists and create template_attachments if missing

Revision ID: tpl_ec_fix_20250918
Revises: tpltxt_20250918
Create Date: 2025-09-18 00:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'tpl_ec_fix_20250918'
down_revision: Union[str, Sequence[str], None] = 'tpltxt_20250918'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    # Add editor_config JSON column if not exists
    try:
        conn.execute(sa.text("ALTER TABLE templates ADD COLUMN IF NOT EXISTS editor_config JSON"))
    except Exception:
        # Some Postgres versions might need different syntax
        try:
            with op.batch_alter_table('templates') as batch_op:
                batch_op.add_column(sa.Column('editor_config', sa.JSON(), nullable=True))
        except Exception:
            pass

    # Create template_attachments if not exists
    try:
        conn.execute(sa.text("SELECT 1 FROM template_attachments LIMIT 1"))
    except Exception:
        op.create_table(
            'template_attachments',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('template_id', sa.UUID(), nullable=False),
            sa.Column('file_name', sa.String(), nullable=False),
            sa.Column('file_url', sa.String(), nullable=False),
            sa.Column('content_type', sa.String(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['template_id'], ['templates.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )


def downgrade() -> None:
    # Do not drop data to be safe; keep no-op
    pass





