"""create faturamentos table

Revision ID: a1b2c3d4e5f6
Revises: efda0c94b422
Create Date: 2026-02-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'g2h3i4j5k6l7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'faturamentos',
        sa.Column('id', sa.INTEGER(), primary_key=True, nullable=False),
        sa.Column('projeto_id', sa.INTEGER(), sa.ForeignKey('projetos.id'), nullable=False),
        sa.Column('tecnico_id', sa.INTEGER(), sa.ForeignKey('funcionarios.id'), nullable=True),
        sa.Column('valor_faturado', sa.Numeric(15,2), nullable=False, server_default='0'),
        sa.Column('data_faturamento', sa.DateTime(timezone=True), nullable=True),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('criado_em', sa.DateTime(timezone=True), nullable=True),
        sa.Column('atualizado_em', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_faturamentos_id', 'faturamentos', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_faturamentos_id', table_name='faturamentos')
    op.drop_table('faturamentos')
