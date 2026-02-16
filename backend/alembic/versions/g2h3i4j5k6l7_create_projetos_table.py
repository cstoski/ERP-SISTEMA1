"""create projetos table

Revision ID: g2h3i4j5k6l7
Revises: f1e2d3c4b5a6
Create Date: 2026-02-16 00:00:01.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'g2h3i4j5k6l7'
down_revision: Union[str, None] = 'f1e2d3c4b5a6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'projetos',
        sa.Column('id', sa.INTEGER(), primary_key=True, nullable=False),
        sa.Column('numero', sa.VARCHAR(length=50), nullable=False),
        sa.Column('cliente_id', sa.INTEGER(), nullable=False),
        sa.Column('nome', sa.VARCHAR(length=255), nullable=False),
        sa.Column('contato_id', sa.INTEGER(), nullable=False),
        sa.Column('tecnico', sa.VARCHAR(length=255), nullable=False),
        sa.Column('valor_orcado', sa.Numeric(15, 2), server_default='0.00', nullable=True),
        sa.Column('valor_venda', sa.Numeric(15, 2), server_default='0.00', nullable=True),
        sa.Column('prazo_entrega_dias', sa.INTEGER(), server_default='0', nullable=True),
        sa.Column('data_pedido_compra', sa.DateTime(), nullable=True),
        sa.Column('status', sa.Enum('ORCANDO', 'ORCAMENTO_ENVIADO', 'DECLINADO', 'EM_EXECUCAO', 'AGUARDANDO_PEDIDO', 'TESTE_VIABILIDADE', 'CONCLUIDO', name='statusprojeto'), server_default='ORCANDO', nullable=True),
        sa.Column('criado_em', sa.DateTime(), nullable=True),
        sa.Column('atualizado_em', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['cliente_id'], ['pessoas_juridicas.id'], ),
        sa.ForeignKeyConstraint(['contato_id'], ['contatos.id'], ),
    )
    op.create_index('ix_projetos_id', 'projetos', ['id'], unique=False)
    op.create_index('ix_projetos_numero', 'projetos', ['numero'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_projetos_numero', table_name='projetos')
    op.drop_index('ix_projetos_id', table_name='projetos')
    op.drop_table('projetos')
    op.execute('DROP TYPE statusprojeto')
