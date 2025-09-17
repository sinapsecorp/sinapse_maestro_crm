"""Create initial tables

Revision ID: 90c0179a3128
Revises: 
Create Date: 2025-09-10 12:55:22.906981

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '90c0179a3128'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    from alembic import op
    import sqlalchemy as sa

    # Criar tabela areas_of_expertise primeiro
    op.create_table('areas_of_expertise',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_areas_of_expertise_name'), 'areas_of_expertise', ['name'], unique=False)

    # Criar tabela leads
    op.create_table('leads',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('email', sa.String(), nullable=True),
    sa.Column('full_name', sa.String(), nullable=True),
    sa.Column('phone', sa.String(), nullable=True),
    sa.Column('company', sa.String(), nullable=True),
    sa.Column('area_of_expertise_id', sa.UUID(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['area_of_expertise_id'], ['areas_of_expertise.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_leads_email'), 'leads', ['email'], unique=True)

    # Campos adicionais conforme layout do XLSX
    with op.batch_alter_table('leads') as batch_op:
        # Obrigatórios
        batch_op.add_column(sa.Column('cnpj', sa.String(), nullable=False))
        batch_op.add_column(sa.Column('razao_social', sa.String(), nullable=False))

        # Opcionais (nullable)
        batch_op.add_column(sa.Column('porte_codigo', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('porte', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('capital_social', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('natureza_juridica_codigo', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('natureza_juridica', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('ente_federativo_responsavel', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('tipo', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('data_abertura', sa.Date(), nullable=True))
        batch_op.add_column(sa.Column('nome_fantasia', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('situacao_cadastral_codigo', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('situacao_cadastral', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('situacao_cadastral_data', sa.Date(), nullable=True))
        batch_op.add_column(sa.Column('situacao_motivo_codigo', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('situacao_motivo', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('situacao_especial_codigo', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('situacao_especial', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('situacao_especial_data', sa.Date(), nullable=True))
        batch_op.add_column(sa.Column('telefone_principal', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('telefone_secundario', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('municipio_ibge', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('logradouro', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('numero', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('complemento', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('bairro', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('cidade', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('estado', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('cep', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('pais_codigo', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('pais', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('atividade_principal_codigo', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('atividade_principal', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('ultima_atualizacao', sa.Date(), nullable=True))

        # Campos existentes com relaxamento de nulidade, se necessário
        try:
            batch_op.alter_column('email', existing_type=sa.String(), nullable=True)
        except Exception:
            pass
        try:
            batch_op.alter_column('full_name', existing_type=sa.String(), nullable=True)
        except Exception:
            pass

    # Índices úteis
    op.create_index('ix_leads_cnpj', 'leads', ['cnpj'], unique=False)
    op.create_table('users',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('password_hash', sa.String(), nullable=False),
    sa.Column('first_name', sa.String(), nullable=False),
    sa.Column('last_name', sa.String(), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_table('campaigns',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('subject', sa.String(), nullable=False),
    sa.Column('body', sa.String(), nullable=False),
    sa.Column('status', sa.Enum('DRAFT', 'SENT', 'SCHEDULED', name='campaignstatus'), nullable=True),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.Column('sent_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('campaign_leads',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('campaign_id', sa.UUID(), nullable=False),
    sa.Column('lead_id', sa.UUID(), nullable=False),
    sa.Column('sent_at', sa.DateTime(), nullable=True),
    sa.Column('status', sa.Enum('PENDING', 'SENT', 'FAILED', name='emailstatus'), nullable=True),
    sa.ForeignKeyConstraint(['campaign_id'], ['campaigns.id'], ),
    sa.ForeignKeyConstraint(['lead_id'], ['leads.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # Remover índices e colunas adicionadas
    try:
        op.drop_index('ix_leads_cnpj', table_name='leads')
    except Exception:
        pass
    with op.batch_alter_table('leads') as batch_op:
        cols = [
            'porte_codigo','porte','capital_social','natureza_juridica_codigo','natureza_juridica',
            'ente_federativo_responsavel','tipo','data_abertura','nome_fantasia','situacao_cadastral_codigo',
            'situacao_cadastral','situacao_cadastral_data','situacao_motivo_codigo','situacao_motivo',
            'situacao_especial_codigo','situacao_especial','situacao_especial_data','telefone_principal',
            'telefone_secundario','municipio_ibge','logradouro','numero','complemento','bairro','cidade',
            'estado','cep','pais_codigo','pais','atividade_principal_codigo','atividade_principal','ultima_atualizacao',
            'cnpj','razao_social'
        ]
        for c in cols:
            try:
                batch_op.drop_column(c)
            except Exception:
                pass
    # (não forçamos voltar nulabilidade para evitar perda de dados)
    op.drop_table('campaign_leads')
    op.drop_index(op.f('ix_leads_email'), table_name='leads')
    op.drop_table('leads')
    op.drop_table('campaigns')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    op.drop_index(op.f('ix_areas_of_expertise_name'), table_name='areas_of_expertise')
    op.drop_table('areas_of_expertise')
    # ### end Alembic commands ###
