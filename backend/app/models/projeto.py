from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base
from ..config import get_local_now

class StatusProjeto(str, enum.Enum):
    ORCANDO = "Orçando"
    ORCAMENTO_ENVIADO = "Orçamento Enviado"
    DECLINADO = "Declinado"
    EM_EXECUCAO = "Em Execução"
    AGUARDANDO_PEDIDO = "Aguardando pedido de compra"
    TESTE_VIABILIDADE = "Teste de Viabilidade"
    CONCLUIDO = "Concluído"

class Projeto(Base):
    __tablename__ = "projetos"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(String(50), unique=True, nullable=False, index=True)
    cliente_id = Column(Integer, ForeignKey("pessoas_juridicas.id"), nullable=False)
    nome = Column(String(255), nullable=False)
    contato_id = Column(Integer, ForeignKey("contatos.id"), nullable=False)
    tecnico = Column(String(255), nullable=False)
    valor_orcado = Column(Numeric(15, 2), default=0.00)
    valor_venda = Column(Numeric(15, 2), default=0.00)
    prazo_entrega_dias = Column(Integer, default=0)
    data_pedido_compra = Column(DateTime, nullable=True)
    status = Column(SQLEnum(StatusProjeto), default=StatusProjeto.ORCANDO)
    criado_em = Column(DateTime, default=get_local_now)
    atualizado_em = Column(DateTime, default=get_local_now, onupdate=get_local_now)

    # Relacionamentos
    cliente = relationship("PessoaJuridica", back_populates="projetos")
    contato = relationship("Contato", back_populates="projetos")
    faturamentos = relationship("Faturamento", back_populates="projeto", cascade="all, delete-orphan")
    despesas = relationship("DespesaProjeto", back_populates="projeto", cascade="all, delete-orphan")
