from pydantic import BaseModel, ConfigDict, field_serializer
from typing import Optional, List
from decimal import Decimal
from datetime import datetime


class FornecedorResumo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    razao_social: str
    nome_fantasia: Optional[str] = None
    tipo: Optional[str] = None


class ProdutoServicoFornecedorBase(BaseModel):
    fornecedor_id: int
    codigo_fornecedor: str
    preco_unitario: Decimal = Decimal("0.00")
    prazo_entrega_dias: int = 0
    icms: Decimal = Decimal("0.00")
    ipi: Decimal = Decimal("0.00")
    pis: Decimal = Decimal("0.00")
    cofins: Decimal = Decimal("0.00")
    iss: Decimal = Decimal("0.00")

    @field_serializer('preco_unitario', 'icms', 'ipi', 'pis', 'cofins', 'iss')
    def serialize_decimal(self, value: Decimal) -> float:
        return float(value) if value is not None else 0.0


class ProdutoServicoFornecedorCreate(ProdutoServicoFornecedorBase):
    pass


class ProdutoServicoFornecedor(ProdutoServicoFornecedorBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    fornecedor: Optional[FornecedorResumo] = None


class ProdutoServicoBase(BaseModel):
    tipo: str
    unidade_medida: str
    descricao: str
    codigo_fabricante: Optional[str] = None
    nome_fabricante: Optional[str] = None
    preco_unitario: Decimal = Decimal("0.00")
    ncm_lcp: Optional[str] = None
    fornecedores: List[ProdutoServicoFornecedorCreate] = []

    @field_serializer('preco_unitario')
    def serialize_decimal(self, value: Decimal) -> float:
        return float(value) if value is not None else 0.0


class ProdutoServicoCreate(ProdutoServicoBase):
    pass


class ProdutoServicoUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    tipo: Optional[str] = None
    unidade_medida: Optional[str] = None
    descricao: Optional[str] = None
    codigo_fabricante: Optional[str] = None
    nome_fabricante: Optional[str] = None
    preco_unitario: Optional[Decimal] = None
    ncm_lcp: Optional[str] = None
    fornecedores: Optional[List[ProdutoServicoFornecedorCreate]] = None


class ProdutoServico(ProdutoServicoBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    codigo_interno: str
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    fornecedores: List[ProdutoServicoFornecedor] = []


class ProdutoServicoHistoricoPrecoBase(BaseModel):
    preco_medio: Decimal = Decimal("0.00")
    preco_minimo: Decimal = Decimal("0.00")
    preco_maximo: Decimal = Decimal("0.00")

    @field_serializer('preco_medio', 'preco_minimo', 'preco_maximo')
    def serialize_decimal(self, value: Decimal) -> float:
        return float(value) if value is not None else 0.0


class ProdutoServicoHistoricoPrecoCreate(ProdutoServicoHistoricoPrecoBase):
    pass


class ProdutoServicoHistoricoPreco(ProdutoServicoHistoricoPrecoBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    produto_servico_id: int
    registrado_em: datetime
