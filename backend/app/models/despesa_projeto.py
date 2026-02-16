from sqlalchemy import Column, Integer, String, Numeric, DateTime, Date, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base
from ..config import get_local_now


class StatusDespesa(str, enum.Enum):
    RASCUNHO = "Rascunho"
    ENVIADO = "Enviado"
    CONFIRMADO = "Confirmado"
    PARCIALMENTE_ENTREGUE = "Parcialmente Entregue"
    ENTREGUE = "Entregue"
    CANCELADO = "Cancelado"


class TipoFrete(str, enum.Enum):
    CIF = "CIF"
    FOB = "FOB"


class DespesaProjeto(Base):
    __tablename__ = "despesas_projetos"

    id = Column(Integer, primary_key=True, index=True)
    numero_despesa = Column(String(50), unique=True, nullable=False, index=True)
    projeto_id = Column(Integer, ForeignKey("projetos.id"), nullable=False)
    fornecedor_id = Column(Integer, ForeignKey("pessoas_juridicas.id"), nullable=False)
    tecnico_responsavel_id = Column(Integer, ForeignKey("funcionarios.id"), nullable=False)
    status = Column(SQLEnum(StatusDespesa), nullable=False, default=StatusDespesa.RASCUNHO)
    data_pedido = Column(Date, nullable=False)
    previsao_entrega = Column(Date, nullable=True)
    prazo_entrega_dias = Column(Integer, nullable=True)
    condicao_pagamento = Column(String(100), nullable=True)
    tipo_frete = Column(SQLEnum(TipoFrete), nullable=True)
    valor_frete = Column(Numeric(15, 2), default=0.00)
    observacoes = Column(Text, nullable=True)
    criado_em = Column(DateTime, default=get_local_now)
    atualizado_em = Column(DateTime, default=get_local_now, onupdate=get_local_now)

    # Relationships
    projeto = relationship("Projeto", back_populates="despesas")
    fornecedor = relationship("PessoaJuridica", foreign_keys=[fornecedor_id])
    tecnico_responsavel = relationship("Funcionario", foreign_keys=[tecnico_responsavel_id])
