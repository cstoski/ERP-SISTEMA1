from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
from datetime import datetime
from decimal import Decimal

from ..database import get_db
from ..models.cronograma import Cronograma as CronogramaModel, CronogramaHistorico as CronogramaHistoricoModel
from ..models.projeto import Projeto as ProjetoModel, StatusProjeto
from ..models.user import User as UserModel
from ..schemas.cronograma import Cronograma, CronogramaCreate, CronogramaUpdate, CronogramaComHistorico
from .auth import get_current_user
from ..config import get_local_now

router = APIRouter()


@router.get("/", response_model=List[dict])
def listar_cronogramas(db: Session = Depends(get_db)):
    """Listar todos os projetos em execução com seus cronogramas"""
    # Buscar todos os projetos com status "Em Execução"
    projetos = db.query(ProjetoModel).filter(
        ProjetoModel.status == StatusProjeto.EM_EXECUCAO
    ).all()
    
    resultado = []
    for projeto in projetos:
        # Verificar se já existe cronograma para este projeto
        cronograma = db.query(CronogramaModel).filter(
            CronogramaModel.projeto_id == projeto.id
        ).first()
        
        # Se não existe, criar um vazio
        if not cronograma:
            cronograma = CronogramaModel(
                projeto_id=projeto.id,
                percentual_conclusao=Decimal('0.00'),
                observacoes=None
            )
            db.add(cronograma)
            db.commit()
            db.refresh(cronograma)
        
        # Calcular status do prazo
        prazo_status = "No prazo"
        dias_restantes = None
        
        if projeto.data_pedido_compra and projeto.prazo_entrega_dias:
            from datetime import timedelta
            prazo_entrega = projeto.data_pedido_compra + timedelta(days=projeto.prazo_entrega_dias)
            dias_restantes = (prazo_entrega - datetime.now()).days
            
            if dias_restantes < 0:
                prazo_status = "Atrasado"
            elif dias_restantes <= 5:
                prazo_status = "Urgente"
            else:
                prazo_status = "No prazo"
        
        resultado.append({
            "id": cronograma.id,
            "projeto_id": projeto.id,
            "projeto_numero": projeto.numero,
            "projeto_nome": projeto.nome,
            "cliente_nome": projeto.cliente.nome_fantasia if projeto.cliente else "",
            "tecnico": projeto.tecnico,
            "percentual_conclusao": float(cronograma.percentual_conclusao),
            "observacoes": cronograma.observacoes,
            "atualizado_em": cronograma.atualizado_em,
            "prazo_status": prazo_status,
            "dias_restantes": dias_restantes,
            "prazo_entrega_dias": projeto.prazo_entrega_dias,
            "data_pedido_compra": projeto.data_pedido_compra
        })
    
    return resultado


@router.get("/projeto/{projeto_id}")
def obter_cronograma_por_projeto(projeto_id: int, db: Session = Depends(get_db)):
    """Obter cronograma de um projeto específico"""
    cronograma = db.query(CronogramaModel).filter(CronogramaModel.projeto_id == projeto_id).first()
    
    if not cronograma:
        return None
    
    projeto = db.query(ProjetoModel).filter(ProjetoModel.id == projeto_id).first()
    
    # Calcular status do prazo
    prazo_status = "No prazo"
    dias_restantes = None
    
    if projeto and projeto.data_pedido_compra and projeto.prazo_entrega_dias:
        from datetime import timedelta
        prazo_entrega = projeto.data_pedido_compra + timedelta(days=projeto.prazo_entrega_dias)
        dias_restantes = (prazo_entrega - datetime.now()).days
        
        if dias_restantes < 0:
            prazo_status = "Atrasado"
        elif dias_restantes <= 5:
            prazo_status = "Urgente"
        else:
            prazo_status = "No prazo"
    
    return {
        "id": cronograma.id,
        "projeto_id": cronograma.projeto_id,
        "percentual_conclusao": float(cronograma.percentual_conclusao),
        "observacoes": cronograma.observacoes,
        "atualizado_em": cronograma.atualizado_em,
        "prazo_status": prazo_status,
        "dias_restantes": dias_restantes
    }


@router.get("/{cronograma_id}", response_model=CronogramaComHistorico)
def obter_cronograma(cronograma_id: int, db: Session = Depends(get_db)):
    """Obter detalhes de um cronograma específico com histórico"""
    cronograma = db.query(CronogramaModel).filter(CronogramaModel.id == cronograma_id).first()
    if not cronograma:
        raise HTTPException(status_code=404, detail="Cronograma não encontrado")
    return cronograma


@router.put("/{cronograma_id}", response_model=Cronograma)
def atualizar_cronograma(
    cronograma_id: int,
    cronograma_update: CronogramaUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Atualizar cronograma e registrar no histórico"""
    cronograma = db.query(CronogramaModel).filter(CronogramaModel.id == cronograma_id).first()
    if not cronograma:
        raise HTTPException(status_code=404, detail="Cronograma não encontrado")
    
    # Criar entrada no histórico antes de atualizar
    historico = CronogramaHistoricoModel(
        cronograma_id=cronograma.id,
        percentual_conclusao=cronograma_update.percentual_conclusao if cronograma_update.percentual_conclusao is not None else cronograma.percentual_conclusao,
        observacoes=cronograma_update.observacoes if cronograma_update.observacoes is not None else cronograma.observacoes,
        criado_por_id=current_user.id
    )
    db.add(historico)
    
    # Atualizar cronograma
    if cronograma_update.percentual_conclusao is not None:
        cronograma.percentual_conclusao = cronograma_update.percentual_conclusao
    if cronograma_update.observacoes is not None:
        cronograma.observacoes = cronograma_update.observacoes
    
    cronograma.atualizado_por_id = current_user.id
    cronograma.atualizado_em = get_local_now()
    
    db.commit()
    db.refresh(cronograma)
    
    return cronograma


@router.get("/{cronograma_id}/historico", response_model=List[dict])
def listar_historico(cronograma_id: int, db: Session = Depends(get_db)):
    """Listar histórico de alterações do cronograma"""
    cronograma = db.query(CronogramaModel).filter(CronogramaModel.id == cronograma_id).first()
    if not cronograma:
        raise HTTPException(status_code=404, detail="Cronograma não encontrado")
    
    historico = db.query(CronogramaHistoricoModel).filter(
        CronogramaHistoricoModel.cronograma_id == cronograma_id
    ).order_by(CronogramaHistoricoModel.criado_em.desc()).all()
    
    return [
        {
            "id": h.id,
            "percentual_conclusao": float(h.percentual_conclusao),
            "observacoes": h.observacoes,
            "alterado_em": h.criado_em,
            "usuario_nome": h.criado_por.username if h.criado_por else None
        }
        for h in historico
    ]
