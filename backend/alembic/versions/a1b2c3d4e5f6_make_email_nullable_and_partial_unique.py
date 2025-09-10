"""make email nullable and partial unique

Revision ID: a1b2c3d4e5f6
Revises: 90c0179a3128
Create Date: 2025-09-10 17:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "90c0179a3128"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Tornar coluna email nullable
    op.alter_column("leads", "email", existing_type=sa.String(), nullable=True)

    # Remover índice único existente (se houver)
    try:
        op.drop_index(op.f("ix_leads_email"), table_name="leads")
    except Exception:
        # índice pode ter outro nome em alguns ambientes
        op.execute("DROP INDEX IF EXISTS ix_leads_email")

    # Criar índice único parcial (somente quando email não é nulo)
    op.create_index(
        op.f("ix_leads_email"),
        "leads",
        ["email"],
        unique=True,
        postgresql_where=sa.text("email IS NOT NULL"),
    )


def downgrade() -> None:
    # Remover índice parcial
    op.drop_index(op.f("ix_leads_email"), table_name="leads")

    # Recriar índice único simples
    op.create_index(op.f("ix_leads_email"), "leads", ["email"], unique=True)

    # Tornar coluna email NOT NULL novamente
    op.alter_column("leads", "email", existing_type=sa.String(), nullable=False)


