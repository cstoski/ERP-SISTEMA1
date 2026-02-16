from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base
from ..config import get_local_now


class TipoProdutoServico(str, enum.Enum):
    PRODUTO = "Produto"
    SERVICO = "Serviço"


class ProdutoServico(Base):
    __tablename__ = "produtos_servicos"

    id = Column(Integer, primary_key=True, index=True)
    codigo_interno = Column(String(8), unique=True, nullable=False, index=True)
    tipo = Column(SQLEnum(TipoProdutoServico), nullable=False)
    unidade_medida = Column(String(20), nullable=False)
    descricao = Column(String(255), nullable=False)
    codigo_fabricante = Column(String(50), nullable=True)
    nome_fabricante = Column(String(255), nullable=True)
    preco_unitario = Column(Numeric(15, 2), default=0.00)
    ncm_lcp = Column(String(50), nullable=True)
    criado_em = Column(DateTime, default=get_local_now)
    atualizado_em = Column(DateTime, default=get_local_now, onupdate=get_local_now)

    fornecedores = relationship(
        "ProdutoServicoFornecedor",
        back_populates="produto_servico",
        cascade="all, delete-orphan",
    )


class ProdutoServicoFornecedor(Base):
    __tablename__ = "produtos_servicos_fornecedores"

    id = Column(Integer, primary_key=True, index=True)
    produto_servico_id = Column(Integer, ForeignKey("produtos_servicos.id"), nullable=False)
    fornecedor_id = Column(Integer, ForeignKey("pessoas_juridicas.id"), nullable=False)
    codigo_fornecedor = Column(String(50), nullable=False)
    preco_unitario = Column(Numeric(15, 2), default=0.00)
    prazo_entrega_dias = Column(Integer, default=0)
    icms = Column(Numeric(5, 2), default=0.00)
    ipi = Column(Numeric(5, 2), default=0.00)
    pis = Column(Numeric(5, 2), default=0.00)
    cofins = Column(Numeric(5, 2), default=0.00)
    iss = Column(Numeric(5, 2), default=0.00)

    produto_servico = relationship("ProdutoServico", back_populates="fornecedores")
    fornecedor = relationship("PessoaJuridica")


class ProdutoServicoHistoricoPreco(Base):
    __tablename__ = "produtos_servicos_historico_precos"

    id = Column(Integer, primary_key=True, index=True)
    produto_servico_id = Column(Integer, ForeignKey("produtos_servicos.id"), nullable=False)
    preco_medio = Column(Numeric(15, 2), nullable=False)
    preco_minimo = Column(Numeric(15, 2), nullable=False)
    preco_maximo = Column(Numeric(15, 2), nullable=False)
    registrado_em = Column(DateTime, default=get_local_now)

    produto_servico = relationship("ProdutoServico")
