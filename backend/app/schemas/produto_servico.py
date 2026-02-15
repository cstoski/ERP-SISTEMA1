from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from decimal import Decimal
from datetime import datetime


class FornecedorResumo(BaseModel):
    id: int
    razao_social: str
    nome_fantasia: Optional[str] = None
    tipo: Optional[str] = None

    class Config:
        from_attributes = True


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


class ProdutoServicoFornecedorCreate(ProdutoServicoFornecedorBase):
    pass


class ProdutoServicoFornecedor(ProdutoServicoFornecedorBase):
    id: int
    fornecedor: Optional[FornecedorResumo] = None

    class Config:
        from_attributes = True


class ProdutoServicoBase(BaseModel):
    tipo: str
    unidade_medida: str
    descricao: str
    codigo_fabricante: Optional[str] = None
    nome_fabricante: Optional[str] = None
    preco_unitario: Decimal = Decimal("0.00")
    ncm: Optional[str] = None
    lcp: Optional[str] = None
    fornecedores: List[ProdutoServicoFornecedorCreate] = []


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
    ncm: Optional[str] = None
    lcp: Optional[str] = None
    fornecedores: Optional[List[ProdutoServicoFornecedorCreate]] = None


class ProdutoServico(ProdutoServicoBase):
    id: int
    codigo_interno: str
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    fornecedores: List[ProdutoServicoFornecedor] = []

    class Config:
        from_attributes = True
