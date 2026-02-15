from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal
from typing import Optional

class ProjetoBase(BaseModel):
    numero: str
    cliente_id: int
    nome: str
    contato_id: int
    tecnico: str
    valor_orcado: Decimal = 0.00
    valor_venda: Decimal = 0.00
    prazo_entrega_dias: int = 0
    data_pedido_compra: Optional[datetime] = None
    status: str = "Orçando"

class ProjetoCreate(ProjetoBase):
    pass

class ProjetoUpdate(BaseModel):
    numero: Optional[str] = None
    cliente_id: Optional[int] = None
    nome: Optional[str] = None
    contato_id: Optional[int] = None
    tecnico: Optional[str] = None
    valor_orcado: Optional[Decimal] = None
    valor_venda: Optional[Decimal] = None
    prazo_entrega_dias: Optional[int] = None
    data_pedido_compra: Optional[datetime] = None
    status: Optional[str] = None

class Projeto(ProjetoBase):
    id: int
    criado_em: datetime
    atualizado_em: datetime

    class Config:
        from_attributes = True
