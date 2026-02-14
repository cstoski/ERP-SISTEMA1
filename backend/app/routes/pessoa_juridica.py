from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.pessoa_juridica import PessoaJuridica as PessoaJuridicaModel
from ..schemas import pessoa_juridica as schemas

router = APIRouter()

@router.post("/", response_model=schemas.PessoaJuridica)
def criar_pessoa_juridica(pessoa: schemas.PessoaJuridicaCreate, db: Session = Depends(get_db)):
    db_cnpj = db.query(PessoaJuridicaModel).filter(PessoaJuridicaModel.cnpj == pessoa.cnpj).first()
    if db_cnpj:
        raise HTTPException(status_code=400, detail="CNPJ já cadastrado")
        
    db_sigla = db.query(PessoaJuridicaModel).filter(PessoaJuridicaModel.sigla == pessoa.sigla).first()
    if db_sigla:
        raise HTTPException(status_code=400, detail="Sigla já cadastrada")

    db_pessoa = PessoaJuridicaModel(**pessoa.model_dump())
    db.add(db_pessoa)
    db.commit()
    db.refresh(db_pessoa)
    return db_pessoa

@router.get("/", response_model=List[schemas.PessoaJuridica])
def listar_pessoas_juridicas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    pessoas = db.query(PessoaJuridicaModel).offset(skip).limit(limit).all()
    return pessoas

@router.get("/{pessoa_id}", response_model=schemas.PessoaJuridica)
def obter_pessoa_juridica(pessoa_id: int, db: Session = Depends(get_db)):
    pessoa = db.query(PessoaJuridicaModel).filter(PessoaJuridicaModel.id == pessoa_id).first()
    if pessoa is None:
        raise HTTPException(status_code=404, detail="Pessoa Jurídica não encontrada")
    return pessoa

@router.put("/{pessoa_id}", response_model=schemas.PessoaJuridica)
def atualizar_pessoa_juridica(pessoa_id: int, pessoa: schemas.PessoaJuridicaUpdate, db: Session = Depends(get_db)):
    db_pessoa = db.query(PessoaJuridicaModel).filter(PessoaJuridicaModel.id == pessoa_id).first()
    if db_pessoa is None:
        raise HTTPException(status_code=404, detail="Pessoa Jurídica não encontrada")
    
    for key, value in pessoa.model_dump().items():
        setattr(db_pessoa, key, value)
    
    db.commit()
    db.refresh(db_pessoa)
    return db_pessoa

@router.delete("/{pessoa_id}")
def deletar_pessoa_juridica(pessoa_id: int, db: Session = Depends(get_db)):
    db_pessoa = db.query(PessoaJuridicaModel).filter(PessoaJuridicaModel.id == pessoa_id).first()
    if db_pessoa is None:
        raise HTTPException(status_code=404, detail="Pessoa Jurídica não encontrada")
    
    db.delete(db_pessoa)
    db.commit()
    return {"message": "Pessoa Jurídica deletada com sucesso"}