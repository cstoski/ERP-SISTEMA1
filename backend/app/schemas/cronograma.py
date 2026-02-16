from pydantic import BaseModel, ConfigDict
from datetime import datetime
from decimal import Decimal
from typing import Optional

# Schema para histórico
class CronogramaHistoricoBase(BaseModel):
    percentual_conclusao: Decimal
    observacoes: Optional[str] = None

class CronogramaHistorico(CronogramaHistoricoBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    cronograma_id: int
    criado_em: datetime
    criado_por_id: Optional[int] = None

# Schema para cronograma
class CronogramaBase(BaseModel):
    percentual_conclusao: Decimal = 0.00
    observacoes: Optional[str] = None

class CronogramaCreate(CronogramaBase):
    projeto_id: int

class CronogramaUpdate(BaseModel):
    percentual_conclusao: Optional[Decimal] = None
    observacoes: Optional[str] = None

class Cronograma(CronogramaBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    projeto_id: int
    atualizado_em: datetime
    atualizado_por_id: Optional[int] = None

# Schema com histórico incluído
class CronogramaComHistorico(Cronograma):
    historico: list[CronogramaHistorico] = []
