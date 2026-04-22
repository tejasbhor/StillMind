#!/usr/bin/env python3
"""Development startup script: Reset database, run migrations, seed data."""

import asyncio
import sys
import os

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.core.database import AsyncSessionLocal, engine
from app.models import *  # noqa: F401,F403


async def reset_and_seed():
    """Drop all tables, recreate, and seed."""
    print("==> Resetting database...")

    async with AsyncSessionLocal() as db:
        # Drop all tables (CASCADE handles foreign keys)
        tables = [
            "user_roles", "role_permissions", "roles", "permissions",
            "admin_configs", "audit_logs", "risk_logs", "session_notes",
            "sessions", "chat_messages", "chat_conversation_participants",
            "chat_conversations", "allocations", "notifications", "assessments",
            "student_profiles", "counselor_profiles", "organizations", "users"
        ]
        for table in tables:
            await db.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
            
        # Drop Enum types to prevent DuplicateObjectErrors
        enums = [
            "chat_conversation_kind", "chat_conversation_status", 
            "chat_participant_role", "assessment_type", "risk_level",
            "user_role", "user_status", "student_profile_status",
            "allocation_status"
        ]
        for enum in enums:
            await db.execute(text(f"DROP TYPE IF EXISTS {enum} CASCADE"))
            
        await db.commit()
        print("==> Database reset complete (Tables & Enums)")
    
    # Dispose engine to close all connections
    await engine.dispose()

    # Recreate tables
    print("==> Creating tables...")
    from app.core.database import Base

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("==> Tables created")

    # Run seed
    print("==> Seeding data...")
    from scripts.seed_all import seed_data

    await seed_data()
    print("==> Seed complete")
    
    # Final cleanup
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(reset_and_seed())
    print("\n==> Development database ready!")
