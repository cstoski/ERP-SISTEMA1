"""Merge NCM and LCP fields into a single field

Revision ID: merge_ncm_lcp
Revises: d4e5f6a7b8c9
Create Date: 2026-02-15 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'merge_ncm_lcp'
down_revision = 'd4e5f6a7b8c9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new column
    op.add_column('produtos_servicos', sa.Column('ncm_lcp', sa.String(50), nullable=True))
    
    # Migrate data from ncm and lcp to ncm_lcp
    connection = op.get_bind()
    connection.execute(sa.text("""
        UPDATE produtos_servicos 
        SET ncm_lcp = CASE 
            WHEN ncm IS NOT NULL AND lcp IS NOT NULL THEN ncm || '/' || lcp
            WHEN ncm IS NOT NULL THEN ncm
            WHEN lcp IS NOT NULL THEN lcp
            ELSE NULL
        END
    """))
    
    # Drop old columns
    op.drop_column('produtos_servicos', 'lcp')
    op.drop_column('produtos_servicos', 'ncm')


def downgrade() -> None:
    # Add back old columns
    op.add_column('produtos_servicos', sa.Column('ncm', sa.String(20), nullable=True))
    op.add_column('produtos_servicos', sa.Column('lcp', sa.String(20), nullable=True))
    
    # Migrate data back
    connection = op.get_bind()
    connection.execute(sa.text("""
        UPDATE produtos_servicos 
        SET ncm = SUBSTR(ncm_lcp, 1, INSTR(ncm_lcp, '/') - 1),
            lcp = SUBSTR(ncm_lcp, INSTR(ncm_lcp, '/') + 1)
        WHERE ncm_lcp LIKE '%/%'
    """))
    connection.execute(sa.text("""
        UPDATE produtos_servicos 
        SET ncm = ncm_lcp
        WHERE ncm_lcp NOT LIKE '%/%' AND ncm IS NULL
    """))
    
    # Drop new column
    op.drop_column('produtos_servicos', 'ncm_lcp')
