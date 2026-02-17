from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class DespesaProjetoItemBase(BaseModel):
    despesa_projeto_id: int
    produto_servico_id: int
    descricao: Optional[str] = None
    quantidade: Decimal
    valor_unitario: Decimal
    icms: Optional[Decimal] = 0.00
    ipi: Optional[Decimal] = 0.00
    pis: Optional[Decimal] = 0.00
    cofins: Optional[Decimal] = 0.00
    iss: Optional[Decimal] = 0.00

class DespesaProjetoItemCreate(DespesaProjetoItemBase):
    pass

class DespesaProjetoItemUpdate(BaseModel):
    descricao: Optional[str] = None
    quantidade: Optional[Decimal] = None
    valor_unitario: Optional[Decimal] = None
    icms: Optional[Decimal] = None
    ipi: Optional[Decimal] = None
    pis: Optional[Decimal] = None
    cofins: Optional[Decimal] = None
    iss: Optional[Decimal] = None

class DespesaProjetoItem(DespesaProjetoItemBase):
    id: int
    class Config:
        orm_mode = True
