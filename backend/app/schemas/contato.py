from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class ContatoBase(BaseModel):
    nome: str
    departamento: Optional[str] = None
    telefone_fixo: Optional[str] = None
    celular: Optional[str] = None
    email: Optional[EmailStr] = None

class ContatoCreate(ContatoBase):
    pessoa_juridica_id: int

class ContatoUpdate(BaseModel):
    nome: Optional[str] = None
    departamento: Optional[str] = None
    telefone_fixo: Optional[str] = None
    celular: Optional[str] = None
    email: Optional[EmailStr] = None
    pessoa_juridica_id: Optional[int] = None

class Contato(ContatoBase):
    id: int
    pessoa_juridica_id: int
    criado_em: datetime
    atualizado_em: Optional[datetime] = None

    class Config:
        from_attributes = True