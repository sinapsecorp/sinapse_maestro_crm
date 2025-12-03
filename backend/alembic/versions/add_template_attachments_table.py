"""add template_attachments table

Revision ID: add_template_attachments
Revises: track_click_convert_status
Create Date: 2025-09-16 12:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_template_attachments'
down_revision: Union[str, Sequence[str], None] = 'track_click_convert_status'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
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

    # editor_config JSON em templates (idempotente)
    try:
        with op.batch_alter_table('templates') as batch_op:
            batch_op.add_column(sa.Column('editor_config', sa.JSON(), nullable=True))
    except Exception:
        pass


def downgrade() -> None:
    op.drop_table('template_attachments')
    try:
        with op.batch_alter_table('templates') as batch_op:
            batch_op.drop_column('editor_config')
    except Exception:
        pass


