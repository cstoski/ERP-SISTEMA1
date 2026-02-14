from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Contato(Base):
    __tablename__ = "contatos"

    id = Column(Integer, primary_key=True, index=True)
    pessoa_juridica_id = Column(Integer, ForeignKey("pessoas_juridicas.id"), nullable=False)
    
    nome = Column(String, nullable=False)
    departamento = Column(String)
    telefone_fixo = Column(String)
    celular = Column(String)
    email = Column(String)

    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())

    pessoa_juridica = relationship("PessoaJuridica", back_populates="contatos")