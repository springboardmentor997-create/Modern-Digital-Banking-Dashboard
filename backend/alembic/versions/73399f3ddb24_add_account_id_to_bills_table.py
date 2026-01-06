"""add account_id to bills table

Revision ID: 73399f3ddb24
Revises: 974d451341b2
Create Date: 2026-01-04
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '73399f3ddb24'
down_revision = '974d451341b2'
branch_labels = None
depends_on = None

def upgrade():
    # Idempotent: only add the column if it does not already exist
    conn = op.get_bind()
    col_exists = conn.execute(
        sa.text("SELECT 1 FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'account_id'")
    ).first() is not None

    if not col_exists:
        op.add_column('bills', sa.Column('account_id', sa.Integer(), nullable=True))

    # Ensure foreign key exists (create if missing)
    fk_exists = conn.execute(
        sa.text("SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'bills' AND constraint_name = 'bills_account_id_fkey'")
    ).first() is not None

    if not fk_exists:
        op.create_foreign_key(
            'bills_account_id_fkey',
            'bills', 'accounts',
            ['account_id'], ['id']
        )

def downgrade():
    # Reversible and safe: use IF EXISTS so downgrade won't fail if items already removed
    op.execute("ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_account_id_fkey")
    op.execute("ALTER TABLE bills DROP COLUMN IF EXISTS account_id")
    op.drop_index(op.f('ix_transactions_id'), table_name='transactions')
