from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from ..database import Base

class PessoaJuridica(Base):
    __tablename__ = "pessoas_juridicas"
    
    id = Column(Integer, primary_key=True, index=True)
    razao_social = Column(String, nullable=False)
    nome_fantasia = Column(String)
    sigla = Column(String(3), unique=True, nullable=False)
    tipo = Column(String, default="Cliente")
    cnpj = Column(String, unique=True, nullable=False)
    inscricao_estadual = Column(String)
    inscricao_municipal = Column(String)
    endereco = Column(String)
    complemento = Column(String)
    cidade = Column(String, default="Curitiba")
    estado = Column(String, default="PR")
    cep = Column(String)
    pais = Column(String, default="Brasil")
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())

    contatos = relationship("Contato", back_populates="pessoa_juridica", cascade="all, delete-orphan")