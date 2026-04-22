"""add_full_name_to_users

Revision ID: b7c2a1e3d4f5
Revises: aeed901338e0
Create Date: 2026-04-22 08:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b7c2a1e3d4f5'
down_revision = 'aeed901338e0'
branch_labels = None
depends_on = None


def upgrade():
    # Add full_name column to users table
    op.add_column('users', sa.Column('full_name', sa.String(length=255), nullable=True))


def downgrade():
    # Remove full_name column from users table
    op.drop_column('users', 'full_name')
