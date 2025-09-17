"""seed whatsapp channel

Revision ID: b7c4d9e1wapp
Revises: a3e1f1c2c3d4
Create Date: 2025-09-15 10:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b7c4d9e1wapp'
down_revision: Union[str, Sequence[str], None] = 'a3e1f1c2c3d4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("INSERT INTO channels (id, name, created_at, updated_at) SELECT gen_random_uuid(), 'Whatsapp', NOW(), NOW() WHERE NOT EXISTS (SELECT 1 FROM channels WHERE name = 'Whatsapp')"))


def downgrade() -> None:
    op.execute("DELETE FROM channels WHERE name = 'Whatsapp'")



