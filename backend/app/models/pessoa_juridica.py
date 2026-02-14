from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from ..database import Base

class PessoaJuridica(Base):
    __tablename__ = "pessoas_juridicas"
    
    id = Column(Integer, primary_key=True, index=True)
    razao_social = Column(String, nullable=False)
    nome_fantasia = Column(String)
    sigla = Column(String(3), nullable=False)
    cnpj = Column(String, unique=True, nullable=False)
    inscricao_estadual = Column(String)
    inscricao_municipal = Column(String)
    endereco = Column(String)
    complemento = Column(String)
    cidade = Column(String, default="Curitiba")
    estado = Column(String, default="PR")
    cep = Column(String)
    pais = Column(String, default="Brasil")
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
