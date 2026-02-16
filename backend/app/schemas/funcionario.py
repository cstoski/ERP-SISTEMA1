from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class FuncionarioBase(BaseModel):
    nome: str
    departamento: Optional[str] = None
    telefone_fixo: Optional[str] = None
    celular: Optional[str] = None
    email: Optional[str] = None

class FuncionarioCreate(FuncionarioBase):
    pass

class FuncionarioUpdate(BaseModel):
    nome: Optional[str] = None
    departamento: Optional[str] = None
    telefone_fixo: Optional[str] = None
    celular: Optional[str] = None
    email: Optional[str] = None

class Funcionario(FuncionarioBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    criado_em: Optional[datetime] = None
    atualizado_em: Optional[datetime] = None
