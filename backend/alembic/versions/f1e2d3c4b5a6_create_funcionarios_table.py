"""create funcionarios table

Revision ID: f1e2d3c4b5a6
Revises: efda0c94b422
Create Date: 2026-02-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1e2d3c4b5a6'
down_revision: Union[str, None] = 'efda0c94b422'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'funcionarios',
        sa.Column('id', sa.INTEGER(), primary_key=True, nullable=False),
        sa.Column('nome', sa.VARCHAR(), nullable=False),
        sa.Column('departamento', sa.VARCHAR(), nullable=True),
        sa.Column('telefone_fixo', sa.VARCHAR(), nullable=True),
        sa.Column('celular', sa.VARCHAR(), nullable=True),
        sa.Column('email', sa.VARCHAR(), nullable=True),
        sa.Column('criado_em', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('atualizado_em', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_funcionarios_id', 'funcionarios', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_funcionarios_id', table_name='funcionarios')
    op.drop_table('funcionarios')
