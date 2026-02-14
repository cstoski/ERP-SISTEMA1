from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.contato import Contato as ContatoModel
from ..schemas.contato import Contato, ContatoCreate, ContatoUpdate

router = APIRouter()

@router.post("/", response_model=Contato)
def criar_contato(contato: ContatoCreate, db: Session = Depends(get_db)):
    db_contato = ContatoModel(**contato.model_dump())
    db.add(db_contato)
    db.commit()
    db.refresh(db_contato)
    return db_contato

@router.get("/", response_model=List[Contato])
def ler_todos_contatos(db: Session = Depends(get_db)):
    contatos = db.query(ContatoModel).all()
    return contatos

@router.get("/pessoa/{pessoa_juridica_id}", response_model=List[Contato])
def ler_contatos_por_pessoa(pessoa_juridica_id: int, db: Session = Depends(get_db)):
    contatos = db.query(ContatoModel).filter(ContatoModel.pessoa_juridica_id == pessoa_juridica_id).all()
    return contatos

@router.put("/{contato_id}", response_model=Contato)
def atualizar_contato(contato_id: int, contato: ContatoUpdate, db: Session = Depends(get_db)):
    db_contato = db.query(ContatoModel).filter(ContatoModel.id == contato_id).first()
    if not db_contato:
        raise HTTPException(status_code=404, detail="Contato não encontrado")
    
    update_data = contato.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_contato, key, value)
        
    db.add(db_contato)
    db.commit()
    db.refresh(db_contato)
    return db_contato

@router.delete("/{contato_id}", response_model=Contato)
def deletar_contato(contato_id: int, db: Session = Depends(get_db)):
    db_contato = db.query(ContatoModel).filter(ContatoModel.id == contato_id).first()
    if not db_contato:
        raise HTTPException(status_code=404, detail="Contato não encontrado")
        
    db.delete(db_contato)
    db.commit()
    return db_contato