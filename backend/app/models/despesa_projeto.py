# Novo modelo para itens de despesa de projeto
from sqlalchemy import Float

class DespesaProjetoItem(Base):
    __tablename__ = "despesas_projetos_itens"

    id = Column(Integer, primary_key=True, index=True)
    despesa_projeto_id = Column(Integer, ForeignKey("despesas_projetos.id"), nullable=False)
    produto_servico_id = Column(Integer, ForeignKey("produtos_servicos.id"), nullable=False)
    descricao = Column(String(255), nullable=True)
    quantidade = Column(Numeric(10, 2), nullable=False, default=1)
    valor_unitario = Column(Numeric(15, 2), nullable=False, default=0.00)
    icms = Column(Numeric(5, 2), default=0.00)
    ipi = Column(Numeric(5, 2), default=0.00)
    pis = Column(Numeric(5, 2), default=0.00)
    cofins = Column(Numeric(5, 2), default=0.00)
    iss = Column(Numeric(5, 2), default=0.00)

    # Relacionamentos
    despesa = relationship("DespesaProjeto", back_populates="itens")
    produto_servico = relationship("ProdutoServico")
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
    contato_id = Column(Integer, ForeignKey("contatos.id"), nullable=True)
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
    contato = relationship("Contato", foreign_keys=[contato_id])
    itens = relationship("DespesaProjetoItem", back_populates="despesa", cascade="all, delete-orphan")
