"""add group_id to rewards

Revision ID: a1b2c3d4e5f6
Revises: 8d7bc4c33c70
Create Date: 2026-01-06
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'a1b2c3d4e5f6'
down_revision = '8d7bc4c33c70'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    # Add column if missing
    col_exists = conn.execute(
        sa.text("SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'group_id'")
    ).first() is not None

    if not col_exists:
        op.add_column('rewards', sa.Column('group_id', sa.Integer(), nullable=True))

    # Create self-referential foreign key if missing
    fk_exists = conn.execute(
        sa.text("SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'rewards' AND constraint_name = 'rewards_group_id_fkey'")
    ).first() is not None

    if not fk_exists:
        op.create_foreign_key(
            'rewards_group_id_fkey',
            'rewards', 'rewards',
            ['group_id'], ['id']
        )


def downgrade():
    # Drop FK and column if they exist
    op.execute("ALTER TABLE rewards DROP CONSTRAINT IF EXISTS rewards_group_id_fkey")
    op.execute("ALTER TABLE rewards DROP COLUMN IF EXISTS group_id")
