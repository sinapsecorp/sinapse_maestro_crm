"""merge heads

Revision ID: 84d10a501999
Revises: f0e1d2c3b4a5, add_template_attachments, b1c2d3e4f5a6
Create Date: 2025-09-18 18:50:19.907152

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '84d10a501999'
down_revision: Union[str, Sequence[str], None] = ('f0e1d2c3b4a5', 'add_template_attachments', 'b1c2d3e4f5a6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
