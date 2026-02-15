from pydantic import BaseModel, field_validator, ConfigDict
from datetime import datetime
from decimal import Decimal
from typing import Optional

# Valores válidos para o status do projeto
VALID_STATUS = [
    "Orçando",
    "Orçamento Enviado",
    "Declinado",
    "Em Execução",
    "Aguardando pedido de compra",
    "Teste de Viabilidade",
    "Concluído"
]

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
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        if v not in VALID_STATUS:
            raise ValueError(f'Status deve ser um dos seguintes: {", ".join(VALID_STATUS)}')
        return v

class ProjetoCreate(ProjetoBase):
    pass

class ProjetoUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    
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
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        if v is not None and v not in VALID_STATUS:
            raise ValueError(f'Status deve ser um dos seguintes: {", ".join(VALID_STATUS)}')
        return v

class Projeto(ProjetoBase):
    id: int
    criado_em: datetime
    atualizado_em: datetime

    class Config:
        from_attributes = True
