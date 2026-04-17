"""Add admin_config table for persistent configuration

Revision ID: c1d2e3f4a5b6
Revises: b9a9ebe8b08d
Create Date: 2026-04-15 23:35:00.000000

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "c1d2e3f4a5b6"
down_revision: Union[str, Sequence[str], None] = "b9a9ebe8b08d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add admin_configs table for persistent configuration."""
    op.create_table(
        "admin_configs",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("config_key", sa.String(length=100), nullable=False),
        sa.Column(
            "config_value", postgresql.JSONB(astext_type=sa.Text()), nullable=False
        ),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("updated_by", sa.String(length=36), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_admin_configs_config_key"),
        "admin_configs",
        ["config_key"],
        unique=True,
    )


def downgrade() -> None:
    """Drop admin_configs table."""
    op.drop_index(op.f("ix_admin_configs_config_key"), table_name="admin_configs")
    op.drop_table("admin_configs")
