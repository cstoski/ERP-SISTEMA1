from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class FaturamentoBase(BaseModel):
    projeto_id: int
    tecnico_id: int
    valor_faturado: float
    data_faturamento: Optional[datetime] = None
    observacoes: Optional[str] = None

class FaturamentoCreate(FaturamentoBase):
    pass

class FaturamentoUpdate(BaseModel):
    tecnico_id: Optional[int] = None
    valor_faturado: Optional[float] = None
    data_faturamento: Optional[datetime] = None
    observacoes: Optional[str] = None

class Faturamento(FaturamentoBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    criado_em: Optional[datetime] = None
    atualizado_em: Optional[datetime] = None
