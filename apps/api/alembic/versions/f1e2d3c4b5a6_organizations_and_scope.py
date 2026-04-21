"""Organizations table, user scoping, nullable allocation counselor.

Revision ID: f1e2d3c4b5a6
Revises: d4f1a2b3c4d5
Create Date: 2026-04-18
"""

from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text
from sqlalchemy.dialects import postgresql

revision: str = "f1e2d3c4b5a6"
down_revision: Union[str, None] = "d4f1a2b3c4d5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "organizations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(100), nullable=False),
        sa.Column("contact_email", sa.String(255), nullable=True),
        sa.Column("settings", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=True,
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=True,
        ),
    )
    op.create_index("ix_organizations_slug", "organizations", ["slug"], unique=True)

    default_id = str(uuid.uuid4())
    conn = op.get_bind()
    conn.execute(
        text(
            """
            INSERT INTO organizations (id, name, slug, contact_email, settings)
            VALUES (:id, 'Default organization', 'default', NULL, CAST(:settings AS jsonb))
            """
        ),
        {"id": default_id, "settings": '{"signup_open": true}'},
    )

    op.add_column(
        "users",
        sa.Column("organization_id", sa.String(36), nullable=True),
    )
    conn.execute(
        text("UPDATE users SET organization_id = :oid WHERE organization_id IS NULL"),
        {"oid": default_id},
    )
    op.alter_column("users", "organization_id", nullable=False)
    op.create_foreign_key(
        "fk_users_organization_id",
        "users",
        "organizations",
        ["organization_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_index("ix_users_organization_id", "users", ["organization_id"])

    op.alter_column(
        "allocations",
        "counselor_id",
        existing_type=sa.String(36),
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "allocations",
        "counselor_id",
        existing_type=sa.String(36),
        nullable=False,
    )
    op.drop_index("ix_users_organization_id", table_name="users")
    op.drop_constraint("fk_users_organization_id", "users", type_="foreignkey")
    op.drop_column("users", "organization_id")
    op.drop_index("ix_organizations_slug", table_name="organizations")
    op.drop_table("organizations")
