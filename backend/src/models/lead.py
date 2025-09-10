import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, DateTime, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.database.base import Base

class Lead(Base):
    __tablename__ = "leads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Compatibilidade legada
    full_name = Column(String, nullable=True)

    # Campos padronizados do layout de importação
    cnpj = Column(String, index=True, nullable=False)
    razao_social = Column(String, nullable=False)
    porte_codigo = Column(String, nullable=True)
    porte = Column(String, nullable=True)
    capital_social = Column(String, nullable=True)
    natureza_juridica_codigo = Column(String, nullable=True)
    natureza_juridica = Column(String, nullable=True)
    ente_federativo_responsavel = Column(String, nullable=True)
    tipo = Column(String, nullable=True)
    data_abertura = Column(Date, nullable=True)
    nome_fantasia = Column(String, nullable=True)
    situacao_cadastral_codigo = Column(String, nullable=True)
    situacao_cadastral = Column(String, nullable=True)
    situacao_cadastral_data = Column(Date, nullable=True)
    situacao_motivo_codigo = Column(String, nullable=True)
    situacao_motivo = Column(String, nullable=True)
    situacao_especial_codigo = Column(String, nullable=True)
    situacao_especial = Column(String, nullable=True)
    situacao_especial_data = Column(Date, nullable=True)

    telefone_principal = Column(String, nullable=True)
    telefone_secundario = Column(String, nullable=True)
    # Campo normalizado usado na listagem/contatos
    phone = Column(String, nullable=True)

    email = Column(String, unique=True, index=True, nullable=True)
    municipio_ibge = Column(String, nullable=True)
    logradouro = Column(String, nullable=True)
    numero = Column(String, nullable=True)
    complemento = Column(String, nullable=True)
    bairro = Column(String, nullable=True)
    cidade = Column(String, nullable=True)
    estado = Column(String, nullable=True)
    cep = Column(String, nullable=True)
    pais_codigo = Column(String, nullable=True)
    pais = Column(String, nullable=True)
    atividade_principal_codigo = Column(String, nullable=True)
    atividade_principal = Column(String, nullable=True)
    ultima_atualizacao = Column(Date, nullable=True)

    # Campos existentes de compatibilidade
    company = Column(String, nullable=True)
    job_title = Column(String, nullable=True)
    
    area_of_expertise_id = Column(UUID(as_uuid=True), ForeignKey("areas_of_expertise.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    area_of_expertise = relationship("AreaOfExpertise", back_populates="leads")
    user = relationship("User")
    campaigns = relationship("CampaignLead", back_populates="lead")
