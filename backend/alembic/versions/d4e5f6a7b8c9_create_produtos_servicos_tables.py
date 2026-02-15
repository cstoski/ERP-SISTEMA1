"""create produtos_servicos tables

Revision ID: d4e5f6a7b8c9
Revises: b3c4d5e6f7a8
Create Date: 2026-02-15 13:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, None] = 'b3c4d5e6f7a8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'produtos_servicos',
        sa.Column('id', sa.INTEGER(), primary_key=True, nullable=False),
        sa.Column('codigo_interno', sa.String(length=8), nullable=False),
        sa.Column('tipo', sa.String(length=20), nullable=False),
        sa.Column('unidade_medida', sa.String(length=20), nullable=False),
        sa.Column('descricao', sa.String(length=255), nullable=False),
        sa.Column('codigo_fabricante', sa.String(length=50), nullable=True),
        sa.Column('nome_fabricante', sa.String(length=255), nullable=True),
        sa.Column('preco_unitario', sa.Numeric(15, 2), nullable=True, server_default='0.00'),
        sa.Column('ncm', sa.String(length=20), nullable=True),
        sa.Column('lcp', sa.String(length=20), nullable=True),
        sa.Column('criado_em', sa.DateTime(timezone=True), nullable=True),
        sa.Column('atualizado_em', sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint('codigo_interno', name='uq_produtos_servicos_codigo_interno'),
    )
    op.create_index('ix_produtos_servicos_id', 'produtos_servicos', ['id'], unique=False)
    op.create_index('ix_produtos_servicos_codigo_interno', 'produtos_servicos', ['codigo_interno'], unique=True)

    op.create_table(
        'produtos_servicos_fornecedores',
        sa.Column('id', sa.INTEGER(), primary_key=True, nullable=False),
        sa.Column('produto_servico_id', sa.INTEGER(), sa.ForeignKey('produtos_servicos.id'), nullable=False),
        sa.Column('fornecedor_id', sa.INTEGER(), sa.ForeignKey('pessoas_juridicas.id'), nullable=False),
        sa.Column('codigo_fornecedor', sa.String(length=50), nullable=False),
        sa.Column('preco_unitario', sa.Numeric(15, 2), nullable=True, server_default='0.00'),
        sa.Column('prazo_entrega_dias', sa.INTEGER(), nullable=True, server_default='0'),
        sa.Column('icms', sa.Numeric(5, 2), nullable=True, server_default='0.00'),
        sa.Column('ipi', sa.Numeric(5, 2), nullable=True, server_default='0.00'),
        sa.Column('pis', sa.Numeric(5, 2), nullable=True, server_default='0.00'),
        sa.Column('cofins', sa.Numeric(5, 2), nullable=True, server_default='0.00'),
        sa.Column('iss', sa.Numeric(5, 2), nullable=True, server_default='0.00'),
    )
    op.create_index(
        'ix_produtos_servicos_fornecedores_id',
        'produtos_servicos_fornecedores',
        ['id'],
        unique=False,
    )
    op.create_index(
        'ix_produtos_servicos_fornecedores_produto_id',
        'produtos_servicos_fornecedores',
        ['produto_servico_id'],
        unique=False,
    )
    op.create_index(
        'ix_produtos_servicos_fornecedores_fornecedor_id',
        'produtos_servicos_fornecedores',
        ['fornecedor_id'],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index('ix_produtos_servicos_fornecedores_fornecedor_id', table_name='produtos_servicos_fornecedores')
    op.drop_index('ix_produtos_servicos_fornecedores_produto_id', table_name='produtos_servicos_fornecedores')
    op.drop_index('ix_produtos_servicos_fornecedores_id', table_name='produtos_servicos_fornecedores')
    op.drop_table('produtos_servicos_fornecedores')

    op.drop_index('ix_produtos_servicos_codigo_interno', table_name='produtos_servicos')
    op.drop_index('ix_produtos_servicos_id', table_name='produtos_servicos')
    op.drop_table('produtos_servicos')
