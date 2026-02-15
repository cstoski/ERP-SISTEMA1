from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Faturamento(Base):
    __tablename__ = "faturamentos"

    id = Column(Integer, primary_key=True, index=True)
    projeto_id = Column(Integer, ForeignKey("projetos.id"), nullable=False)
    tecnico_id = Column(Integer, ForeignKey("funcionarios.id"), nullable=False)
    valor_faturado = Column(Numeric(15,2), nullable=False, default=0.00)
    data_faturamento = Column(DateTime(timezone=True), server_default=func.now())
    observacoes = Column(Text)

    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())

    projeto = relationship("Projeto", back_populates="faturamentos")
    tecnico = relationship("Funcionario")
