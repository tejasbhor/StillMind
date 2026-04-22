"""add_domain_to_organizations

Revision ID: aeed901338e0
Revises: e2289f7a1f4c
Create Date: 2026-04-22 13:24:32.399060

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aeed901338e0'
down_revision: Union[str, Sequence[str], None] = 'e2289f7a1f4c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('organizations', sa.Column('domain', sa.String(length=255), nullable=True))
    op.create_index(op.f('ix_organizations_domain'), 'organizations', ['domain'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_organizations_domain'), table_name='organizations')
    op.drop_column('organizations', 'domain')
