"""add notifications table

Revision ID: 8d7bc4c33c70
Revises: 73399f3ddb24
Create Date: 2026-01-04 20:17:39.887719
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '8d7bc4c33c70'
down_revision = '73399f3ddb24'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    table_exists = conn.execute(sa.text("SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' LIMIT 1")).first() is not None

    if not table_exists:
        # Create notifications table (safe/conditional)
        op.create_table(
            'notifications',
            sa.Column('id', sa.Integer(), primary_key=True, nullable=False),
            sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
            sa.Column('type', sa.String(length=50), nullable=False),
            sa.Column('title', sa.String(length=200), nullable=False),
            sa.Column('message', sa.Text(), nullable=False),
            sa.Column('scheduled_date', postgresql.TIMESTAMP(timezone=True), nullable=True),
            sa.Column('sent', sa.Boolean(), server_default=sa.text('false'), nullable=False),
            sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        )

        # Indexes for common queries
        op.create_index('ix_notifications_user_id', 'notifications', ['user_id'], unique=False)
        op.create_index('ix_notifications_type', 'notifications', ['type'], unique=False)
        op.create_index('ix_notifications_scheduled_date', 'notifications', ['scheduled_date'], unique=False)


def downgrade():
    # Drop indexes and table if exists
    op.execute("DROP INDEX IF EXISTS ix_notifications_scheduled_date")
    op.execute("DROP INDEX IF EXISTS ix_notifications_type")
    op.execute("DROP INDEX IF EXISTS ix_notifications_user_id")
    op.execute("DROP TABLE IF EXISTS notifications")
