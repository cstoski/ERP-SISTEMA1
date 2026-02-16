from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class DespesaProjetoBase(BaseModel):
    projeto_id: int
    fornecedor_id: int
    tecnico_responsavel_id: int
    status: str
    data_pedido: date
    previsao_entrega: Optional[date] = None
    prazo_entrega_dias: Optional[int] = None
    condicao_pagamento: Optional[str] = None
    tipo_frete: Optional[str] = None
    valor_frete: float = 0.00
    observacoes: Optional[str] = None


class DespesaProjetoCreate(DespesaProjetoBase):
    pass


class DespesaProjetoUpdate(BaseModel):
    projeto_id: Optional[int] = None
    fornecedor_id: Optional[int] = None
    tecnico_responsavel_id: Optional[int] = None
    status: Optional[str] = None
    data_pedido: Optional[date] = None
    previsao_entrega: Optional[date] = None
    prazo_entrega_dias: Optional[int] = None
    condicao_pagamento: Optional[str] = None
    tipo_frete: Optional[str] = None
    valor_frete: Optional[float] = None
    observacoes: Optional[str] = None


class DespesaProjeto(DespesaProjetoBase):
    id: int
    numero_despesa: str
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    
    # Dados relacionados
    projeto: Optional[dict] = None
    fornecedor: Optional[dict] = None
    tecnico_responsavel: Optional[dict] = None

    class Config:
        from_attributes = True
