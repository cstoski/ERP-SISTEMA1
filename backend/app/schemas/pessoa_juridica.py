from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime
from typing import Optional, List
from .contato import Contato

class PessoaJuridicaBase(BaseModel):
    razao_social: str
    nome_fantasia: Optional[str] = None
    sigla: str = Field(..., min_length=1, max_length=3)
    tipo: Optional[str] = "Cliente"
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
    @field_validator('cnpj')
    @classmethod
    def validate_cnpj(cls, v: str) -> str:
        cnpj = ''.join(filter(str.isdigit, v))
        if len(cnpj) != 14:
            raise ValueError('CNPJ deve conter 14 dígitos')

        # Validação do primeiro dígito verificador
        soma = 0
        peso = 5
        for i in range(12):
            soma += int(cnpj[i]) * peso
            peso -= 1
            if peso < 2:
                peso = 9
        resto = soma % 11
        dv1 = 0 if resto < 2 else 11 - resto
        if dv1 != int(cnpj[12]):
            raise ValueError('CNPJ inválido')

        # Validação do segundo dígito verificador
        soma = 0
        peso = 6
        for i in range(13):
            soma += int(cnpj[i]) * peso
            peso -= 1
            if peso < 2:
                peso = 9
        resto = soma % 11
        dv2 = 0 if resto < 2 else 11 - resto
        if dv2 != int(cnpj[13]):
            raise ValueError('CNPJ inválido')
            
        return cnpj

class PessoaJuridicaUpdate(BaseModel):
    razao_social: Optional[str] = None
    nome_fantasia: Optional[str] = None
    sigla: Optional[str] = Field(None, min_length=1, max_length=3)
    tipo: Optional[str] = None
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

    @field_validator('cnpj')
    @classmethod
    def validate_cnpj(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        
        cnpj = ''.join(filter(str.isdigit, v))
        if len(cnpj) != 14:
            raise ValueError('CNPJ deve conter 14 dígitos')

        # Validação do primeiro dígito verificador
        soma = 0
        peso = 5
        for i in range(12):
            soma += int(cnpj[i]) * peso
            peso -= 1
            if peso < 2:
                peso = 9
        resto = soma % 11
        dv1 = 0 if resto < 2 else 11 - resto
        if dv1 != int(cnpj[12]):
            raise ValueError('CNPJ inválido')

        # Validação do segundo dígito verificador
        soma = 0
        peso = 6
        for i in range(13):
            soma += int(cnpj[i]) * peso
            peso -= 1
            if peso < 2:
                peso = 9
        resto = soma % 11
        dv2 = 0 if resto < 2 else 11 - resto
        if dv2 != int(cnpj[13]):
            raise ValueError('CNPJ inválido')
            
        return cnpj

class PessoaJuridica(PessoaJuridicaBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    contatos: List[Contato] = []