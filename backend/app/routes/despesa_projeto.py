from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime

from ..database import get_db
from ..models.despesa_projeto import DespesaProjeto, DespesaProjetoItem
from ..models.projeto import Projeto
from ..models.pessoa_juridica import PessoaJuridica
from ..models.funcionario import Funcionario
from ..schemas.despesa_projeto import (
    DespesaProjeto as DespesaProjetoSchema,
    DespesaProjetoCreate,
    DespesaProjetoUpdate,
)
from ..schemas.despesa_projeto_item import (
    DespesaProjetoItem as DespesaProjetoItemSchema,
    DespesaProjetoItemCreate,
    DespesaProjetoItemUpdate,
)

router = APIRouter()


def gerar_numero_despesa(db: Session, projeto_id: int, fornecedor_id: int) -> str:
    """
    Gera número da despesa no formato: PC+numero_projeto+sigla_fornecedor+numero_sequencial
    Exemplo: PC2601001-MRP01
    """
    # Busca o projeto
    projeto = db.query(Projeto).filter(Projeto.id == projeto_id).first()
    if not projeto:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    # Busca o fornecedor
    fornecedor = db.query(PessoaJuridica).filter(PessoaJuridica.id == fornecedor_id).first()
    if not fornecedor:
        raise HTTPException(status_code=404, detail="Fornecedor não encontrado")
    
    # Conta quantas despesas já existem para este projeto + fornecedor
    count = db.query(DespesaProjeto).filter(
        DespesaProjeto.projeto_id == projeto_id,
        DespesaProjeto.fornecedor_id == fornecedor_id
    ).count()
    
    numero_sequencial = str(count + 1).zfill(2)  # 01, 02, 03, etc
    sigla_fornecedor = fornecedor.sigla or "XXX"
    
    # Formato: PC + numero_projeto (sem prefixo TC) + sigla_fornecedor + numero_sequencial
    numero_projeto = projeto.numero
    if numero_projeto.startswith("TC"):
        numero_projeto = numero_projeto[2:]
    numero_despesa = f"PC{numero_projeto}-{sigla_fornecedor}{numero_sequencial}"
    
    return numero_despesa


@router.get("/despesas-projetos", response_model=List[DespesaProjetoSchema])
def listar_despesas(db: Session = Depends(get_db)):
    """Lista todas as despesas de projetos"""
    despesas = db.query(DespesaProjeto).options(
        joinedload(DespesaProjeto.projeto),
        joinedload(DespesaProjeto.fornecedor),
        joinedload(DespesaProjeto.tecnico_responsavel)
    ).all()
    
    # Formata os dados relacionados
    result = []
    for despesa in despesas:
        despesa_dict = {
            "id": despesa.id,
            "numero_despesa": despesa.numero_despesa,
            "projeto_id": despesa.projeto_id,
            "fornecedor_id": despesa.fornecedor_id,
            "tecnico_responsavel_id": despesa.tecnico_responsavel_id,
            "contato_id": despesa.contato_id,
            "status": despesa.status,
            "data_pedido": despesa.data_pedido,
            "previsao_entrega": despesa.previsao_entrega,
            "prazo_entrega_dias": despesa.prazo_entrega_dias,
            "condicao_pagamento": despesa.condicao_pagamento,
            "tipo_frete": despesa.tipo_frete,
            "valor_frete": float(despesa.valor_frete) if despesa.valor_frete else 0.0,
            "observacoes": despesa.observacoes,
            "criado_em": despesa.criado_em,
            "atualizado_em": despesa.atualizado_em,
            "projeto": {
                "id": despesa.projeto.id,
                "numero": despesa.projeto.numero,
                "nome": despesa.projeto.nome,
            } if despesa.projeto else None,
            "fornecedor": {
                "id": despesa.fornecedor.id,
                "razao_social": despesa.fornecedor.razao_social,
                "sigla": despesa.fornecedor.sigla,
            } if despesa.fornecedor else None,
            "tecnico_responsavel": {
                "id": despesa.tecnico_responsavel.id,
                "nome": despesa.tecnico_responsavel.nome,
            } if despesa.tecnico_responsavel else None,
        }
        result.append(despesa_dict)
    
    return result


@router.get("/despesas-projetos/{despesa_id}", response_model=DespesaProjetoSchema)
def obter_despesa(despesa_id: int, db: Session = Depends(get_db)):
    """Obtém uma despesa específica"""
    despesa = db.query(DespesaProjeto).options(
        joinedload(DespesaProjeto.projeto),
        joinedload(DespesaProjeto.fornecedor),
        joinedload(DespesaProjeto.tecnico_responsavel)
    ).filter(DespesaProjeto.id == despesa_id).first()
    
    if not despesa:
        raise HTTPException(status_code=404, detail="Despesa não encontrada")
    
    despesa_dict = {
        "id": despesa.id,
        "numero_despesa": despesa.numero_despesa,
        "projeto_id": despesa.projeto_id,
        "fornecedor_id": despesa.fornecedor_id,
        "tecnico_responsavel_id": despesa.tecnico_responsavel_id,
        "contato_id": despesa.contato_id,
        "status": despesa.status,
        "data_pedido": despesa.data_pedido,
        "previsao_entrega": despesa.previsao_entrega,
        "prazo_entrega_dias": despesa.prazo_entrega_dias,
        "condicao_pagamento": despesa.condicao_pagamento,
        "tipo_frete": despesa.tipo_frete,
        "valor_frete": float(despesa.valor_frete) if despesa.valor_frete else 0.0,
        "observacoes": despesa.observacoes,
        "criado_em": despesa.criado_em,
        "atualizado_em": despesa.atualizado_em,
        "projeto": {
            "id": despesa.projeto.id,
            "numero": despesa.projeto.numero,
            "nome": despesa.projeto.nome,
        } if despesa.projeto else None,
        "fornecedor": {
            "id": despesa.fornecedor.id,
            "razao_social": despesa.fornecedor.razao_social,
            "sigla": despesa.fornecedor.sigla,
        } if despesa.fornecedor else None,
        "tecnico_responsavel": {
            "id": despesa.tecnico_responsavel.id,
            "nome": despesa.tecnico_responsavel.nome,
        } if despesa.tecnico_responsavel else None,
    }
    
    return despesa_dict


@router.post("/despesas-projetos", response_model=DespesaProjetoSchema)
def criar_despesa(despesa: DespesaProjetoCreate, db: Session = Depends(get_db)):
    """Cria uma nova despesa de projeto"""
    print(f"[DEBUG] Dados recebidos para criar despesa: {despesa.model_dump()}")
    
    # Gera o número da despesa
    numero_despesa = gerar_numero_despesa(db, despesa.projeto_id, despesa.fornecedor_id)
    
    # Cria a despesa
    db_despesa = DespesaProjeto(
        numero_despesa=numero_despesa,
        **despesa.model_dump()
    )
    
    db.add(db_despesa)
    db.commit()
    db.refresh(db_despesa)
    
    # Recarrega com relationships
    despesa_completa = db.query(DespesaProjeto).options(
        joinedload(DespesaProjeto.projeto),
        joinedload(DespesaProjeto.fornecedor),
        joinedload(DespesaProjeto.tecnico_responsavel)
    ).filter(DespesaProjeto.id == db_despesa.id).first()
    
    despesa_dict = {
        "id": despesa_completa.id,
        "numero_despesa": despesa_completa.numero_despesa,
        "projeto_id": despesa_completa.projeto_id,
        "fornecedor_id": despesa_completa.fornecedor_id,
        "tecnico_responsavel_id": despesa_completa.tecnico_responsavel_id,
        "contato_id": despesa_completa.contato_id,
        "status": despesa_completa.status,
        "data_pedido": despesa_completa.data_pedido,
        "previsao_entrega": despesa_completa.previsao_entrega,
        "prazo_entrega_dias": despesa_completa.prazo_entrega_dias,
        "condicao_pagamento": despesa_completa.condicao_pagamento,
        "tipo_frete": despesa_completa.tipo_frete,
        "valor_frete": float(despesa_completa.valor_frete) if despesa_completa.valor_frete else 0.0,
        "observacoes": despesa_completa.observacoes,
        "criado_em": despesa_completa.criado_em,
        "atualizado_em": despesa_completa.atualizado_em,
        "projeto": {
            "id": despesa_completa.projeto.id,
            "numero": despesa_completa.projeto.numero,
            "nome": despesa_completa.projeto.nome,
        } if despesa_completa.projeto else None,
        "fornecedor": {
            "id": despesa_completa.fornecedor.id,
            "razao_social": despesa_completa.fornecedor.razao_social,
            "sigla": despesa_completa.fornecedor.sigla,
        } if despesa_completa.fornecedor else None,
        "tecnico_responsavel": {
            "id": despesa_completa.tecnico_responsavel.id,
            "nome": despesa_completa.tecnico_responsavel.nome,
        } if despesa_completa.tecnico_responsavel else None,
    }
    
    return despesa_dict


@router.put("/despesas-projetos/{despesa_id}", response_model=DespesaProjetoSchema)
def atualizar_despesa(despesa_id: int, despesa: DespesaProjetoUpdate, db: Session = Depends(get_db)):
    """Atualiza uma despesa existente"""
    db_despesa = db.query(DespesaProjeto).filter(DespesaProjeto.id == despesa_id).first()
    
    if not db_despesa:
        raise HTTPException(status_code=404, detail="Despesa não encontrada")
    
    # Atualiza apenas os campos fornecidos
    update_data = despesa.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_despesa, key, value)
    
    db.commit()
    db.refresh(db_despesa)
    
    # Recarrega com relationships
    despesa_completa = db.query(DespesaProjeto).options(
        joinedload(DespesaProjeto.projeto),
        joinedload(DespesaProjeto.fornecedor),
        joinedload(DespesaProjeto.tecnico_responsavel)
    ).filter(DespesaProjeto.id == db_despesa.id).first()
    
    despesa_dict = {
        "id": despesa_completa.id,
        "numero_despesa": despesa_completa.numero_despesa,
        "projeto_id": despesa_completa.projeto_id,
        "fornecedor_id": despesa_completa.fornecedor_id,
        "tecnico_responsavel_id": despesa_completa.tecnico_responsavel_id,
        "contato_id": despesa_completa.contato_id,
        "status": despesa_completa.status,
        "data_pedido": despesa_completa.data_pedido,
        "previsao_entrega": despesa_completa.previsao_entrega,
        "prazo_entrega_dias": despesa_completa.prazo_entrega_dias,
        "condicao_pagamento": despesa_completa.condicao_pagamento,
        "tipo_frete": despesa_completa.tipo_frete,
        "valor_frete": float(despesa_completa.valor_frete) if despesa_completa.valor_frete else 0.0,
        "observacoes": despesa_completa.observacoes,
        "criado_em": despesa_completa.criado_em,
        "atualizado_em": despesa_completa.atualizado_em,
        "projeto": {
            "id": despesa_completa.projeto.id,
            "numero": despesa_completa.projeto.numero,
            "nome": despesa_completa.projeto.nome,
        } if despesa_completa.projeto else None,
        "fornecedor": {
            "id": despesa_completa.fornecedor.id,
            "razao_social": despesa_completa.fornecedor.razao_social,
            "sigla": despesa_completa.fornecedor.sigla,
        } if despesa_completa.fornecedor else None,
        "tecnico_responsavel": {
            "id": despesa_completa.tecnico_responsavel.id,
            "nome": despesa_completa.tecnico_responsavel.nome,
        } if despesa_completa.tecnico_responsavel else None,
    }
    
    return despesa_dict


@router.delete("/despesas-projetos/{despesa_id}")
def deletar_despesa(despesa_id: int, db: Session = Depends(get_db)):
    """Deleta uma despesa"""
    db_despesa = db.query(DespesaProjeto).filter(DespesaProjeto.id == despesa_id).first()
    
    if not db_despesa:
        raise HTTPException(status_code=404, detail="Despesa não encontrada")
    
    db.delete(db_despesa)
    db.commit()
    
    return {"detail": "Despesa deletada com sucesso"}


# CRUD de itens de despesa de projeto
@router.get("/despesas-projetos/{despesa_id}/itens", response_model=List[DespesaProjetoItemSchema])
def listar_itens_despesa(despesa_id: int, db: Session = Depends(get_db)):
    itens = db.query(DespesaProjetoItem).filter(DespesaProjetoItem.despesa_projeto_id == despesa_id).all()
    return itens

@router.post("/despesas-projetos/{despesa_id}/itens", response_model=DespesaProjetoItemSchema)
def criar_item_despesa(despesa_id: int, item: DespesaProjetoItemCreate, db: Session = Depends(get_db)):
    if item.despesa_projeto_id != despesa_id:
        raise HTTPException(status_code=400, detail="ID de despesa inconsistente")
    db_item = DespesaProjetoItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/despesas-projetos/itens/{item_id}", response_model=DespesaProjetoItemSchema)
def obter_item_despesa(item_id: int, db: Session = Depends(get_db)):
    item = db.query(DespesaProjetoItem).filter(DespesaProjetoItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    return item

@router.put("/despesas-projetos/itens/{item_id}", response_model=DespesaProjetoItemSchema)
def atualizar_item_despesa(item_id: int, item: DespesaProjetoItemUpdate, db: Session = Depends(get_db)):
    db_item = db.query(DespesaProjetoItem).filter(DespesaProjetoItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    for key, value in item.model_dump(exclude_unset=True).items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/despesas-projetos/itens/{item_id}")
def deletar_item_despesa(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(DespesaProjetoItem).filter(DespesaProjetoItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    db.delete(db_item)
    db.commit()
    return {"detail": "Item deletado com sucesso"}
