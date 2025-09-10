from pydantic import BaseModel, EmailStr, UUID4
from typing import Optional, List
from datetime import date

class LeadBase(BaseModel):
    # Campos do layout padrão (no backend podem ser opcionais por dados legados; import exige ambos)
    cnpj: Optional[str] = None
    razao_social: Optional[str] = None

    porte_codigo: Optional[str] = None
    porte: Optional[str] = None
    capital_social: Optional[str] = None
    natureza_juridica_codigo: Optional[str] = None
    natureza_juridica: Optional[str] = None
    ente_federativo_responsavel: Optional[str] = None
    tipo: Optional[str] = None
    data_abertura: Optional[date] = None
    nome_fantasia: Optional[str] = None
    situacao_cadastral_codigo: Optional[str] = None
    situacao_cadastral: Optional[str] = None
    situacao_cadastral_data: Optional[date] = None
    situacao_motivo_codigo: Optional[str] = None
    situacao_motivo: Optional[str] = None
    situacao_especial_codigo: Optional[str] = None
    situacao_especial: Optional[str] = None
    situacao_especial_data: Optional[date] = None
    telefone_principal: Optional[str] = None
    telefone_secundario: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    municipio_ibge: Optional[str] = None
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None
    pais_codigo: Optional[str] = None
    pais: Optional[str] = None
    atividade_principal_codigo: Optional[str] = None
    atividade_principal: Optional[str] = None
    ultima_atualizacao: Optional[date] = None

    # compatibilidade
    full_name: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    area_of_expertise_id: UUID4

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    area_of_expertise_id: Optional[UUID4] = None

class LeadInDB(BaseModel):
    id: UUID4
    cnpj: Optional[str] = None
    razao_social: Optional[str] = None
    porte_codigo: Optional[str] = None
    porte: Optional[str] = None
    capital_social: Optional[str] = None
    natureza_juridica_codigo: Optional[str] = None
    natureza_juridica: Optional[str] = None
    ente_federativo_responsavel: Optional[str] = None
    tipo: Optional[str] = None
    data_abertura: Optional[date] = None
    nome_fantasia: Optional[str] = None
    situacao_cadastral_codigo: Optional[str] = None
    situacao_cadastral: Optional[str] = None
    situacao_cadastral_data: Optional[date] = None
    situacao_motivo_codigo: Optional[str] = None
    situacao_motivo: Optional[str] = None
    situacao_especial_codigo: Optional[str] = None
    situacao_especial: Optional[str] = None
    situacao_especial_data: Optional[date] = None
    telefone_principal: Optional[str] = None
    telefone_secundario: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    municipio_ibge: Optional[str] = None
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None
    pais_codigo: Optional[str] = None
    pais: Optional[str] = None
    atividade_principal_codigo: Optional[str] = None
    atividade_principal: Optional[str] = None
    ultima_atualizacao: Optional[date] = None
    full_name: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    area_of_expertise_id: UUID4
    user_id: UUID4

    class Config:
        orm_mode = True


class LeadBulkDeleteByAreasRequest(BaseModel):
    area_of_expertise_ids: List[UUID4]

class LeadBulkDeleteResult(BaseModel):
    deleted: int
