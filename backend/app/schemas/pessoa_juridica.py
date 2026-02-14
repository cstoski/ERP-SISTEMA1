from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional

class PessoaJuridicaBase(BaseModel):
    razao_social: str
    nome_fantasia: Optional[str] = None
    sigla: str = Field(..., min_length=1, max_length=3)
    cnpj: str
    inscricao_estadual: Optional[str] = None
    inscricao_municipal: Optional[str] = None
    endereco: Optional[str] = None
    complemento: Optional[str] = None
    cidade: str = "Curitiba"
    estado: str = "PR"
    cep: Optional[str] = None
    pais: str = "Brasil"
    
    @field_validator('sigla')
    @classmethod
    def sigla_must_be_max_3_chars(cls, v: str) -> str:
        if len(v) > 3:
            raise ValueError('Sigla deve ter no máximo 3 caracteres')
        return v.upper()

class PessoaJuridicaCreate(PessoaJuridicaBase):
    pass

class PessoaJuridicaUpdate(BaseModel):
    razao_social: Optional[str] = None
    nome_fantasia: Optional[str] = None
    sigla: Optional[str] = Field(None, min_length=1, max_length=3)
    cnpj: Optional[str] = None
    inscricao_estadual: Optional[str] = None
    inscricao_municipal: Optional[str] = None
    endereco: Optional[str] = None
    complemento: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None
    pais: Optional[str] = None
    
    @field_validator('sigla')
    @classmethod
    def sigla_must_be_max_3_chars(cls, v: Optional[str]) -> Optional[str]:
        if v and len(v) > 3:
            raise ValueError('Sigla deve ter no máximo 3 caracteres')
        return v.upper() if v else None

class PessoaJuridica(PessoaJuridicaBase):
    id: int
    criado_em: datetime
    atualizado_em: datetime
    
    class Config:
        from_attributes = True
