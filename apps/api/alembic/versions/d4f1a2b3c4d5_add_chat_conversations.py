"""Add chat conversation tables and conversation_id linkage.

Revision ID: d4f1a2b3c4d5
Revises: c1d2e3f4a5b6, add_rbac_tables
Create Date: 2026-04-18 14:20:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d4f1a2b3c4d5"
down_revision: Union[str, Sequence[str], None] = ("c1d2e3f4a5b6", "add_rbac_tables")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


    # Create the enum types explicitly first
    bind = op.get_bind()
    sa.Enum("DIRECT", "GROUP", name="chat_conversation_kind").create(bind, checkfirst=True)
    sa.Enum("ACTIVE", "ARCHIVED", name="chat_conversation_status").create(bind, checkfirst=True)
    sa.Enum("student", "counselor", "admin", "system", name="chat_participant_role").create(bind, checkfirst=True)

    op.create_table(
        "chat_conversations",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column(
            "kind", 
            sa.Enum(name="chat_conversation_kind"), 
            nullable=False, 
            server_default="DIRECT"
        ),
        sa.Column("title", sa.String(length=200), nullable=True),
        sa.Column(
            "status", 
            sa.Enum(name="chat_conversation_status"), 
            nullable=False, 
            server_default="ACTIVE"
        ),
        sa.Column("allocation_id", sa.String(length=36), nullable=True),
        sa.Column("created_by_user_id", sa.String(length=36), nullable=False),
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
        sa.ForeignKeyConstraint(["allocation_id"], ["allocations.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(
            ["created_by_user_id"], ["users.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_chat_conversations_status"), "chat_conversations", ["status"], unique=False
    )
    op.create_index(
        op.f("ix_chat_conversations_allocation_id"),
        "chat_conversations",
        ["allocation_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_chat_conversations_created_at"),
        "chat_conversations",
        ["created_at"],
        unique=False,
    )

    op.create_table(
        "chat_conversation_participants",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("conversation_id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("role", sa.Enum(name="chat_participant_role"), nullable=False),
        sa.Column(
            "joined_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["conversation_id"], ["chat_conversations.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "conversation_id",
            "user_id",
            name="uq_chat_conversation_participant_conversation_user",
        ),
    )
    op.create_index(
        op.f("ix_chat_conversation_participants_conversation_id"),
        "chat_conversation_participants",
        ["conversation_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_chat_conversation_participants_user_id"),
        "chat_conversation_participants",
        ["user_id"],
        unique=False,
    )

    op.add_column(
        "chat_messages", sa.Column("conversation_id", sa.String(length=36), nullable=True)
    )
    op.create_index(
        op.f("ix_chat_messages_conversation_id"),
        "chat_messages",
        ["conversation_id"],
        unique=False,
    )
    op.create_foreign_key(
        "fk_chat_messages_conversation_id",
        "chat_messages",
        "chat_conversations",
        ["conversation_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.alter_column("chat_messages", "allocation_id", existing_type=sa.String(length=36), nullable=True)

    # Backfill legacy allocation-based chats into conversations.
    op.execute(
        """
        INSERT INTO chat_conversations (id, kind, status, allocation_id, created_by_user_id, created_at, updated_at)
        SELECT
          allocations.id,
          'DIRECT',
          'ACTIVE',
          allocations.id,
          student_profiles.user_id,
          now(),
          now()
        FROM allocations
        JOIN student_profiles ON student_profiles.id = allocations.student_id
        ON CONFLICT (id) DO NOTHING
        """
    )
    op.execute(
        """
        INSERT INTO chat_conversation_participants (id, conversation_id, user_id, role, joined_at)
        SELECT
          lower(
            substr(md5(allocations.id || student_profiles.user_id || 'student'), 1, 8) || '-' ||
            substr(md5(allocations.id || student_profiles.user_id || 'student'), 9, 4) || '-' ||
            substr(md5(allocations.id || student_profiles.user_id || 'student'), 13, 4) || '-' ||
            substr(md5(allocations.id || student_profiles.user_id || 'student'), 17, 4) || '-' ||
            substr(md5(allocations.id || student_profiles.user_id || 'student'), 21, 12)
          ),
          allocations.id,
          student_profiles.user_id,
          'student',
          now()
        FROM allocations
        JOIN student_profiles ON student_profiles.id = allocations.student_id
        ON CONFLICT ON CONSTRAINT uq_chat_conversation_participant_conversation_user DO NOTHING
        """
    )
    op.execute(
        """
        INSERT INTO chat_conversation_participants (id, conversation_id, user_id, role, joined_at)
        SELECT
          lower(
            substr(md5(allocations.id || counselor_profiles.user_id || 'counselor'), 1, 8) || '-' ||
            substr(md5(allocations.id || counselor_profiles.user_id || 'counselor'), 9, 4) || '-' ||
            substr(md5(allocations.id || counselor_profiles.user_id || 'counselor'), 13, 4) || '-' ||
            substr(md5(allocations.id || counselor_profiles.user_id || 'counselor'), 17, 4) || '-' ||
            substr(md5(allocations.id || counselor_profiles.user_id || 'counselor'), 21, 12)
          ),
          allocations.id,
          counselor_profiles.user_id,
          'counselor',
          now()
        FROM allocations
        JOIN counselor_profiles ON counselor_profiles.id = allocations.counselor_id
        ON CONFLICT ON CONSTRAINT uq_chat_conversation_participant_conversation_user DO NOTHING
        """
    )
    op.execute(
        """
        UPDATE chat_messages
        SET conversation_id = allocation_id
        WHERE conversation_id IS NULL AND allocation_id IS NOT NULL
        """
    )
    op.alter_column(
        "chat_messages",
        "conversation_id",
        existing_type=sa.String(length=36),
        nullable=False,
    )


def downgrade() -> None:
    op.alter_column("chat_messages", "allocation_id", existing_type=sa.String(length=36), nullable=False)
    op.drop_constraint("fk_chat_messages_conversation_id", "chat_messages", type_="foreignkey")
    op.drop_index(op.f("ix_chat_messages_conversation_id"), table_name="chat_messages")
    op.drop_column("chat_messages", "conversation_id")

    op.drop_index(
        op.f("ix_chat_conversation_participants_user_id"),
        table_name="chat_conversation_participants",
    )
    op.drop_index(
        op.f("ix_chat_conversation_participants_conversation_id"),
        table_name="chat_conversation_participants",
    )
    op.drop_table("chat_conversation_participants")

    op.drop_index(op.f("ix_chat_conversations_created_at"), table_name="chat_conversations")
    op.drop_index(op.f("ix_chat_conversations_allocation_id"), table_name="chat_conversations")
    op.drop_index(op.f("ix_chat_conversations_status"), table_name="chat_conversations")
    op.drop_table("chat_conversations")

    bind = op.get_bind()
    sa.Enum(name="chat_participant_role").drop(bind, checkfirst=True)
    sa.Enum(name="chat_conversation_status").drop(bind, checkfirst=True)
    sa.Enum(name="chat_conversation_kind").drop(bind, checkfirst=True)
