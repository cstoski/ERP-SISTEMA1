from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

from ..database import get_db
from ..models.produto_servico import (
    ProdutoServico as ProdutoServicoModel,
    ProdutoServicoFornecedor as ProdutoServicoFornecedorModel,
    TipoProdutoServico,
)
from ..models.pessoa_juridica import PessoaJuridica as PessoaJuridicaModel
from ..models.user import User
from ..schemas import produto_servico as schemas

# Configuração local para autenticação (mesmos valores do auth.py)
SECRET_KEY = "CHANGE_THIS_SECRET_KEY"
ALGORITHM = "HS256"
oauth2_scheme_local = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

def get_current_user_local(token: str = Depends(oauth2_scheme_local), db: Session = Depends(get_db)):
    """Versão local de get_current_user para evitar problemas de importação"""
    print(f"[DEBUG LOCAL] get_current_user_local chamado")
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    from ..models.user import User as UserModel
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if user is None:
        raise credentials_exception
    return user

router = APIRouter()


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
    current_user: User = Depends(get_current_user_local),
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
        ncm=produto.ncm,
        lcp=produto.lcp,
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
    return db_produto


@router.get("/", response_model=List[schemas.ProdutoServico])
def listar_produtos_servicos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_local),
):
    print(f"[DEBUG ROTA] listar_produtos_servicos chamado. Usuário: {current_user.username if current_user else 'None'}")
    return db.query(ProdutoServicoModel).all()


@router.get("/{produto_id}", response_model=schemas.ProdutoServico)
def obter_produto_servico(
    produto_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_local),
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
    current_user: User = Depends(get_current_user_local),
):
    db_produto = db.query(ProdutoServicoModel).filter(ProdutoServicoModel.id == produto_id).first()
    if not db_produto:
        raise HTTPException(status_code=404, detail="Produto/Serviço não encontrado")

    update_data = produto.model_dump(exclude_unset=True)
    fornecedores = update_data.pop("fornecedores", None)

    for key, value in update_data.items():
        setattr(db_produto, key, value)

    if fornecedores is not None:
        db.query(ProdutoServicoFornecedorModel).filter(
            ProdutoServicoFornecedorModel.produto_servico_id == produto_id
        ).delete()

        for fornecedor in fornecedores:
            fornecedor_existe = db.query(PessoaJuridicaModel).filter(
                PessoaJuridicaModel.id == fornecedor.fornecedor_id
            ).first()
            if not fornecedor_existe:
                raise HTTPException(status_code=400, detail="Fornecedor não encontrado")

            db_fornecedor = ProdutoServicoFornecedorModel(
                produto_servico_id=produto_id,
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
    return db_produto


@router.delete("/{produto_id}")
def deletar_produto_servico(
    produto_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_local),
):
    db_produto = db.query(ProdutoServicoModel).filter(ProdutoServicoModel.id == produto_id).first()
    if not db_produto:
        raise HTTPException(status_code=404, detail="Produto/Serviço não encontrado")

    db.delete(db_produto)
    db.commit()
    return {"message": "Produto/Serviço deletado com sucesso"}


