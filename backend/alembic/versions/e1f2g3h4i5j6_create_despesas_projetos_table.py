"""create despesas projetos table

Revision ID: e1f2g3h4i5j6
Revises: merge_ncm_lcp
Create Date: 2026-02-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e1f2g3h4i5j6'
down_revision = 'merge_ncm_lcp'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'despesas_projetos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('numero_despesa', sa.String(length=50), nullable=False),
        sa.Column('projeto_id', sa.Integer(), nullable=False),
        sa.Column('fornecedor_id', sa.Integer(), nullable=False),
        sa.Column('tecnico_responsavel_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum('Rascunho', 'Enviado', 'Confirmado', 'Parcialmente Entregue', 'Entregue', 'Cancelado', name='statusdespesa'), nullable=False),
        sa.Column('data_pedido', sa.Date(), nullable=False),
        sa.Column('previsao_entrega', sa.Date(), nullable=True),
        sa.Column('prazo_entrega_dias', sa.Integer(), nullable=True),
        sa.Column('condicao_pagamento', sa.String(length=100), nullable=True),
        sa.Column('tipo_frete', sa.Enum('CIF', 'FOB', name='tipofrete'), nullable=True),
        sa.Column('valor_frete', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('criado_em', sa.DateTime(), nullable=True),
        sa.Column('atualizado_em', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['fornecedor_id'], ['pessoas_juridicas.id'], ),
        sa.ForeignKeyConstraint(['projeto_id'], ['projetos.id'], ),
        sa.ForeignKeyConstraint(['tecnico_responsavel_id'], ['funcionarios.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_despesas_projetos_id'), 'despesas_projetos', ['id'], unique=False)
    op.create_index(op.f('ix_despesas_projetos_numero_despesa'), 'despesas_projetos', ['numero_despesa'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_despesas_projetos_numero_despesa'), table_name='despesas_projetos')
    op.drop_index(op.f('ix_despesas_projetos_id'), table_name='despesas_projetos')
    op.drop_table('despesas_projetos')
    op.execute('DROP TYPE statusdespesa')
    op.execute('DROP TYPE tipofrete')
