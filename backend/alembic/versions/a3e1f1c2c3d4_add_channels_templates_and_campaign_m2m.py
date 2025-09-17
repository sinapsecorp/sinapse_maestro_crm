"""add channels, templates and campaign m2m

Revision ID: a3e1f1c2c3d4
Revises: 90c0179a3128
Create Date: 2025-09-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a3e1f1c2c3d4'
down_revision: Union[str, Sequence[str], None] = '6d21da318163'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # channels
    op.create_table(
        'channels',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # templates
    op.create_table(
        'templates',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('subject', sa.String(), nullable=False),
        sa.Column('content', sa.String(), nullable=False),
        sa.Column('channel_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['channel_id'], ['channels.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # campaign status enum add ARCHIVED
    try:
        op.execute("ALTER TYPE campaignstatus ADD VALUE IF NOT EXISTS 'ARCHIVED'")
    except Exception:
        pass

    # campaign template fk
    with op.batch_alter_table('campaigns') as batch_op:
        batch_op.add_column(sa.Column('template_id', sa.UUID(), nullable=True))
        batch_op.create_foreign_key('fk_campaigns_template', 'templates', ['template_id'], ['id'])

    # m2m campaign_channels
    op.create_table(
        'campaign_channels',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('campaign_id', sa.UUID(), nullable=False),
        sa.Column('channel_id', sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(['campaign_id'], ['campaigns.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['channel_id'], ['channels.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('campaign_id', 'channel_id', name='uq_campaign_channel')
    )

    # m2m campaign_areas
    op.create_table(
        'campaign_areas',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('campaign_id', sa.UUID(), nullable=False),
        sa.Column('area_of_expertise_id', sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(['campaign_id'], ['campaigns.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['area_of_expertise_id'], ['areas_of_expertise.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('campaign_id', 'area_of_expertise_id', name='uq_campaign_area')
    )

    # seed default channels
    from uuid import uuid4
    conn = op.get_bind()
    email_id = str(uuid4())
    sms_id = str(uuid4())
    conn.execute(sa.text("INSERT INTO channels (id, name, created_at, updated_at) VALUES (:id, :name, NOW(), NOW()) ON CONFLICT (name) DO NOTHING"), {"id": email_id, "name": "E-mail"})
    conn.execute(sa.text("INSERT INTO channels (id, name, created_at, updated_at) VALUES (:id, :name, NOW(), NOW()) ON CONFLICT (name) DO NOTHING"), {"id": sms_id, "name": "SMS"})


def downgrade() -> None:
    op.drop_table('campaign_areas')
    op.drop_table('campaign_channels')
    with op.batch_alter_table('campaigns') as batch_op:
        try:
            batch_op.drop_constraint('fk_campaigns_template', type_='foreignkey')
        except Exception:
            pass
        try:
            batch_op.drop_column('template_id')
        except Exception:
            pass
    op.drop_table('templates')
    op.drop_table('channels')


