"""add marketing accounts and credentials and campaign fk

Revision ID: f0e1d2c3b4a5
Revises: a3e1f1c2c3d4
Create Date: 2025-09-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f0e1d2c3b4a5'
down_revision: Union[str, Sequence[str], None] = 'a3e1f1c2c3d4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'marketing_accounts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    op.create_table(
        'smtp_credentials',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('account_id', sa.UUID(), nullable=False),
        sa.Column('host', sa.String(), nullable=False),
        sa.Column('port', sa.String(), nullable=False),
        sa.Column('encryption', sa.String(), nullable=True),
        sa.Column('username_enc', sa.String(), nullable=True),
        sa.Column('password_enc', sa.String(), nullable=True),
        sa.Column('from_name', sa.String(), nullable=True),
        sa.Column('from_address', sa.String(), nullable=True),
        sa.Column('reply_to', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['account_id'], ['marketing_accounts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('account_id')
    )

    op.create_table(
        'sms_credentials',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('account_id', sa.UUID(), nullable=False),
        sa.Column('api_key_enc', sa.String(), nullable=True),
        sa.Column('client_id_enc', sa.String(), nullable=True),
        sa.Column('secret_enc', sa.String(), nullable=True),
        sa.Column('provider', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['account_id'], ['marketing_accounts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('account_id')
    )

    op.create_table(
        'whatsapp_credentials',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('account_id', sa.UUID(), nullable=False),
        sa.Column('api_key_enc', sa.String(), nullable=True),
        sa.Column('client_id_enc', sa.String(), nullable=True),
        sa.Column('secret_enc', sa.String(), nullable=True),
        sa.Column('provider', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['account_id'], ['marketing_accounts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('account_id')
    )

    with op.batch_alter_table('campaigns') as batch_op:
        batch_op.add_column(sa.Column('marketing_account_id', sa.UUID(), nullable=True))
        batch_op.create_foreign_key('fk_campaigns_marketing_account', 'marketing_accounts', ['marketing_account_id'], ['id'])


def downgrade() -> None:
    with op.batch_alter_table('campaigns') as batch_op:
        try:
            batch_op.drop_constraint('fk_campaigns_marketing_account', type_='foreignkey')
        except Exception:
            pass
        try:
            batch_op.drop_column('marketing_account_id')
        except Exception:
            pass

    op.drop_table('whatsapp_credentials')
    op.drop_table('sms_credentials')
    op.drop_table('smtp_credentials')
    op.drop_table('marketing_accounts')


