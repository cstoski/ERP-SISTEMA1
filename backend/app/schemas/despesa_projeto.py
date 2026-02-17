from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date, datetime


class DespesaProjetoBase(BaseModel):
    projeto_id: int
    fornecedor_id: int
    tecnico_responsavel_id: int
    contato_id: Optional[int] = None

    status: str

    @field_validator('status', mode='before')
    @classmethod
    def normalize_status(cls, v):
        valid = {
            'rascunho': 'Rascunho',
            'enviado': 'Enviado',
            'confirmado': 'Confirmado',
            'parcialmente entregue': 'Parcialmente Entregue',
            'entregue': 'Entregue',
            'cancelado': 'Cancelado',
        }
        if isinstance(v, str):
            v_lower = v.strip().lower()
            if v_lower in valid:
                return valid[v_lower]
            # Se vier em caixa alta, tenta converter para o valor correto
            for key, val in valid.items():
                if v.strip().upper() == key.upper() or v.strip().upper() == val.upper():
                    return val
            return v
        return v

    # Removido suporte a core_schema/GetCoreSchemaHandler para compatibilidade com Pydantic v1
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
    contato_id: Optional[int] = None
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
    contato_id: Optional[int] = None
    # Dados relacionados
    projeto: Optional[dict] = None
    fornecedor: Optional[dict] = None
    tecnico_responsavel: Optional[dict] = None
