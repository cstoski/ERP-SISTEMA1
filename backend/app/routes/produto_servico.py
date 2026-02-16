from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal

from ..database import get_db
from ..models.produto_servico import (
    ProdutoServico as ProdutoServicoModel,
    ProdutoServicoFornecedor as ProdutoServicoFornecedorModel,
    ProdutoServicoHistoricoPreco as ProdutoServicoHistoricoPrecoModel,
    TipoProdutoServico,
)
from ..models.pessoa_juridica import PessoaJuridica as PessoaJuridicaModel
from ..schemas import produto_servico as schemas

router = APIRouter()


def calcular_preco_com_impostos(
    preco_unitario: Decimal,
    ipi: Decimal
) -> Decimal:
    """Calcula o preço com impostos (apenas IPI é adicionado, outros são por dentro)"""
    preco_base = Decimal(str(preco_unitario)) or Decimal("0.00")
    ipi_percent = Decimal(str(ipi)) or Decimal("0.00")
    ipi_valor = ipi_percent / 100
    return preco_base * (1 + ipi_valor)


def calcular_preco_medio_com_impostos(db: Session, produto_id: int) -> tuple[Decimal, Decimal, Decimal]:
    """Calcula preço médio, mínimo e máximo com impostos para um produto"""
    fornecedores = db.query(ProdutoServicoFornecedorModel).filter(
        ProdutoServicoFornecedorModel.produto_servico_id == produto_id
    ).all()
    
    if not fornecedores:
        return Decimal("0.00"), Decimal("0.00"), Decimal("0.00")
    
    precos = [
        calcular_preco_com_impostos(f.preco_unitario, f.ipi)
        for f in fornecedores
    ]
    
    total = sum(precos)
    media = total / len(precos)
    minimo = min(precos)
    maximo = max(precos)
    
    return media, minimo, maximo


def registrar_historico_precos(db: Session, produto_id: int, preco_meio: Decimal, preco_minimo: Decimal, preco_maximo: Decimal):
    """Registra os preços no histórico"""
    historico = ProdutoServicoHistoricoPrecoModel(
        produto_servico_id=produto_id,
        preco_medio=preco_meio,
        preco_minimo=preco_minimo,
        preco_maximo=preco_maximo,
    )
    db.add(historico)
    db.commit()



@router.get("/test-health")
def test_health():
    print("[DEBUG] test_health chamado")
    return {"status": "ok", "message": "Router produtos-servicos está funcionando"}


@router.get("/test-auth")
def test_auth(authorization: Optional[str] = Header(None)):
    print(f"[DEBUG] test_auth chamado. Header Authorization: {authorization}")
    if not authorization:
        return {"error": "No authorization header"}
    if not authorization.startswith("Bearer "):
        return {"error": "Authorization header não começa com 'Bearer '"}
    token = authorization.replace("Bearer ", "")
    print(f"[DEBUG] Token extraído: {token[:50]}...")
    return {"success": True, "token_length": len(token)}


def gerar_codigo_interno(db: Session, tipo: str) -> str:
    if tipo == TipoProdutoServico.PRODUTO.value:
        prefixo = "P"
    elif tipo == TipoProdutoServico.SERVICO.value:
        prefixo = "S"
    else:
        raise HTTPException(status_code=400, detail="Tipo inválido. Use Produto ou Serviço")

    ultimo = (
        db.query(ProdutoServicoModel)
        .filter(ProdutoServicoModel.tipo == tipo)
        .order_by(ProdutoServicoModel.codigo_interno.desc())
        .first()
    )

    proximo_numero = 1
    if ultimo and ultimo.codigo_interno and len(ultimo.codigo_interno) >= 2:
        ultimo_numero = ultimo.codigo_interno[1:]
        if ultimo_numero.isdigit():
            proximo_numero = int(ultimo_numero) + 1

    return f"{prefixo}{proximo_numero:07d}"


@router.post("/", response_model=schemas.ProdutoServico)
def criar_produto_servico(
    produto: schemas.ProdutoServicoCreate,
    db: Session = Depends(get_db),
):
    codigo_interno = gerar_codigo_interno(db, produto.tipo)

    db_produto = ProdutoServicoModel(
        codigo_interno=codigo_interno,
        tipo=produto.tipo,
        unidade_medida=produto.unidade_medida,
        descricao=produto.descricao,
        codigo_fabricante=produto.codigo_fabricante,
        nome_fabricante=produto.nome_fabricante,
        preco_unitario=produto.preco_unitario,
        ncm_lcp=produto.ncm_lcp,
    )
    db.add(db_produto)
    db.flush()

    for fornecedor in produto.fornecedores:
        fornecedor_existe = db.query(PessoaJuridicaModel).filter(
            PessoaJuridicaModel.id == fornecedor.fornecedor_id
        ).first()
        if not fornecedor_existe:
            raise HTTPException(status_code=400, detail="Fornecedor não encontrado")

        db_fornecedor = ProdutoServicoFornecedorModel(
            produto_servico_id=db_produto.id,
            fornecedor_id=fornecedor.fornecedor_id,
            codigo_fornecedor=fornecedor.codigo_fornecedor,
            preco_unitario=fornecedor.preco_unitario,
            prazo_entrega_dias=fornecedor.prazo_entrega_dias,
            icms=fornecedor.icms,
            ipi=fornecedor.ipi,
            pis=fornecedor.pis,
            cofins=fornecedor.cofins,
            iss=fornecedor.iss,
        )
        db.add(db_fornecedor)

    db.commit()
    db.refresh(db_produto)
    
    # Registra o preço inicial no histórico (se houver fornecedores)
    if produto.fornecedores:
        media, minimo, maximo = calcular_preco_medio_com_impostos(db, db_produto.id)
        registrar_historico_precos(db, db_produto.id, media, minimo, maximo)
    
    return db_produto


@router.get("/", response_model=List[schemas.ProdutoServico])
def listar_produtos_servicos(
    db: Session = Depends(get_db),
):
    return db.query(ProdutoServicoModel).all()


@router.get("/{produto_id}", response_model=schemas.ProdutoServico)
def obter_produto_servico(
    produto_id: int,
    db: Session = Depends(get_db),
):
    produto = db.query(ProdutoServicoModel).filter(ProdutoServicoModel.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto/Serviço não encontrado")
    return produto


@router.put("/{produto_id}", response_model=schemas.ProdutoServico)
def atualizar_produto_servico(
    produto_id: int,
    produto: schemas.ProdutoServicoUpdate,
    db: Session = Depends(get_db),
):
    db_produto = db.query(ProdutoServicoModel).filter(ProdutoServicoModel.id == produto_id).first()
    if not db_produto:
        raise HTTPException(status_code=404, detail="Produto/Serviço não encontrado")

    update_data = produto.model_dump(exclude_unset=True)
    fornecedores = update_data.pop("fornecedores", None)

    for key, value in update_data.items():
        setattr(db_produto, key, value)

    if fornecedores is not None:
        # Remove os fornecedores antigos
        db.query(ProdutoServicoFornecedorModel).filter(
            ProdutoServicoFornecedorModel.produto_servico_id == produto_id
        ).delete()

        # Adiciona os novos fornecedores
        for fornecedor in fornecedores:
            # fornecedor é um dict após model_dump()
            fornecedor_existe = db.query(PessoaJuridicaModel).filter(
                PessoaJuridicaModel.id == fornecedor['fornecedor_id']
            ).first()
            if not fornecedor_existe:
                raise HTTPException(status_code=400, detail="Fornecedor não encontrado")

            db_fornecedor = ProdutoServicoFornecedorModel(
                produto_servico_id=produto_id,
                fornecedor_id=fornecedor['fornecedor_id'],
                codigo_fornecedor=fornecedor['codigo_fornecedor'],
                preco_unitario=fornecedor['preco_unitario'],
                prazo_entrega_dias=fornecedor['prazo_entrega_dias'],
                icms=fornecedor['icms'],
                ipi=fornecedor['ipi'],
                pis=fornecedor['pis'],
                cofins=fornecedor['cofins'],
                iss=fornecedor['iss'],
            )
            db.add(db_fornecedor)

    db.commit()
    
    # Calcula e registra o novo preço médio no histórico
    if fornecedores is not None:
        media, minimo, maximo = calcular_preco_medio_com_impostos(db, produto_id)
        registrar_historico_precos(db, produto_id, media, minimo, maximo)
    
    db.refresh(db_produto)
    return db_produto


@router.delete("/{produto_id}")
def deletar_produto_servico(
    produto_id: int,
    db: Session = Depends(get_db),
):
    db_produto = db.query(ProdutoServicoModel).filter(ProdutoServicoModel.id == produto_id).first()
    if not db_produto:
        raise HTTPException(status_code=404, detail="Produto/Serviço não encontrado")

    db.delete(db_produto)
    db.commit()
    return {"message": "Produto/Serviço deletado com sucesso"}


@router.get("/{produto_id}/historico-precos", response_model=List[schemas.ProdutoServicoHistoricoPreco])
def obter_historico_precos(
    produto_id: int,
    db: Session = Depends(get_db),
):
    """Retorna o histórico de preços médios de um produto"""
    produto = db.query(ProdutoServicoModel).filter(ProdutoServicoModel.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto/Serviço não encontrado")
    
    historico = db.query(ProdutoServicoHistoricoPrecoModel).filter(
        ProdutoServicoHistoricoPrecoModel.produto_servico_id == produto_id
    ).order_by(ProdutoServicoHistoricoPrecoModel.registrado_em.asc()).all()
    
    return historico
