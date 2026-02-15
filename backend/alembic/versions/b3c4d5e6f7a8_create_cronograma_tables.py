"""create cronograma tables

Revision ID: b3c4d5e6f7a8
Revises: a1b2c3d4e5f6
Create Date: 2026-02-15 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b3c4d5e6f7a8'
down_revision: Union[str, None] = '3f1a9b_users_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Tabela cronogramas
    op.create_table(
        'cronogramas',
        sa.Column('id', sa.INTEGER(), primary_key=True, nullable=False),
        sa.Column('projeto_id', sa.INTEGER(), sa.ForeignKey('projetos.id'), nullable=False, unique=True),
        sa.Column('percentual_conclusao', sa.Numeric(5, 2), nullable=True, server_default='0.00'),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('atualizado_em', sa.DateTime(timezone=True), nullable=True),
        sa.Column('atualizado_por_id', sa.INTEGER(), sa.ForeignKey('users.id'), nullable=True),
    )
    op.create_index('ix_cronogramas_id', 'cronogramas', ['id'], unique=False)
    op.create_index('ix_cronogramas_projeto_id', 'cronogramas', ['projeto_id'], unique=True)

    # Tabela cronogramas_historico
    op.create_table(
        'cronogramas_historico',
        sa.Column('id', sa.INTEGER(), primary_key=True, nullable=False),
        sa.Column('cronograma_id', sa.INTEGER(), sa.ForeignKey('cronogramas.id'), nullable=False),
        sa.Column('percentual_conclusao', sa.Numeric(5, 2), nullable=False),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('criado_em', sa.DateTime(timezone=True), nullable=True),
        sa.Column('criado_por_id', sa.INTEGER(), sa.ForeignKey('users.id'), nullable=True),
    )
    op.create_index('ix_cronogramas_historico_id', 'cronogramas_historico', ['id'], unique=False)
    op.create_index('ix_cronogramas_historico_cronograma_id', 'cronogramas_historico', ['cronograma_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_cronogramas_historico_cronograma_id', table_name='cronogramas_historico')
    op.drop_index('ix_cronogramas_historico_id', table_name='cronogramas_historico')
    op.drop_table('cronogramas_historico')
    
    op.drop_index('ix_cronogramas_projeto_id', table_name='cronogramas')
    op.drop_index('ix_cronogramas_id', table_name='cronogramas')
    op.drop_table('cronogramas')
