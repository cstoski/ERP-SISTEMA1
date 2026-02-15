from sqlalchemy import Column, Integer, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from ..database import Base
from ..config import get_local_now

class Cronograma(Base):
    __tablename__ = "cronogramas"

    id = Column(Integer, primary_key=True, index=True)
    projeto_id = Column(Integer, ForeignKey("projetos.id"), nullable=False, unique=True)
    percentual_conclusao = Column(Numeric(5, 2), default=0.00)  # 0.00 a 100.00
    observacoes = Column(Text, nullable=True)
    atualizado_em = Column(DateTime, default=get_local_now, onupdate=get_local_now)
    atualizado_por_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relacionamentos
    projeto = relationship("Projeto", backref="cronograma")
    atualizado_por = relationship("User")
    historico = relationship("CronogramaHistorico", back_populates="cronograma", cascade="all, delete-orphan", order_by="desc(CronogramaHistorico.criado_em)")


class CronogramaHistorico(Base):
    __tablename__ = "cronogramas_historico"

    id = Column(Integer, primary_key=True, index=True)
    cronograma_id = Column(Integer, ForeignKey("cronogramas.id"), nullable=False)
    percentual_conclusao = Column(Numeric(5, 2), nullable=False)
    observacoes = Column(Text, nullable=True)
    criado_em = Column(DateTime, default=get_local_now)
    criado_por_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relacionamentos
    cronograma = relationship("Cronograma", back_populates="historico")
    criado_por = relationship("User")
