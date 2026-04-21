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
        await db.execute(text("DROP TABLE IF EXISTS admin_configs CASCADE"))
        await db.execute(text("DROP TABLE IF EXISTS audit_logs CASCADE"))
        await db.execute(text("DROP TABLE IF EXISTS risk_logs CASCADE"))
        await db.execute(text("DROP TABLE IF EXISTS session_notes CASCADE"))
        await db.execute(text("DROP TABLE IF EXISTS sessions CASCADE"))
        await db.execute(text("DROP TABLE IF EXISTS chat_messages CASCADE"))
        await db.execute(text("DROP TABLE IF EXISTS allocations CASCADE"))
        await db.execute(text("DROP TABLE IF EXISTS notifications CASCADE"))
        await db.execute(text("DROP TABLE IF EXISTS assessments CASCADE"))
        await db.execute(text("DROP TABLE IF EXISTS student_profiles CASCADE"))
        await db.execute(text("DROP TABLE IF EXISTS counselor_profiles CASCADE"))
        await db.execute(text("DROP TABLE IF EXISTS organizations CASCADE"))
        await db.execute(text("DROP TABLE IF EXISTS users CASCADE"))
        await db.commit()
        print("==> Database reset complete")

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


if __name__ == "__main__":
    asyncio.run(reset_and_seed())
    print("\n==> Development database ready!")
