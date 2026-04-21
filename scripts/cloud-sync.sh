#!/bin/bash

# =====================================================
# StillMind — Cloud Sync & Redeploy Script
# Run from: /opt/stillmind
# =====================================================

# Move to project directory
cd /opt/stillmind

echo "📥 [1/6] Pulling latest code from GitHub..."
git pull origin main

# 2. Sync environment variables (ensures .env has what it needs)
if [ ! -f .env ]; then
    echo "⚠️ .env not found. Copying from production example..."
    cp .env.production.example .env
fi

# 3. Stop services (prevents memory collisions during build)
echo "🛑 [2/6] Stopping containers..."
docker compose down

# 4. Rebuild sequentially to conserve RAM on OCI free-tier
# Building Next.js is memory-intensive, so we do it alone.
echo "🏗️ [3/6] Rebuilding Backend (FastAPI)..."
docker compose build backend

echo "🏗️ [4/6] Rebuilding Frontend (Next.js Standalone)..."
# We don't need sudo if we're in the docker group, but following your pattern
docker compose build frontend

# 5. Start all services
echo "🚀 [5/6] Starting services..."
docker compose up -d --remove-orphans

# 6. Apply database migrations & Seed data
echo "⌛ Waiting for DB to stabilize..."
sleep 10

echo "🗃️ [6/6] Running migrations..."
docker compose exec -T backend uv run alembic upgrade head

echo "🌱 Seeding institutional data & test accounts..."
docker compose exec -T backend uv run python scripts/seed_all.py

echo ""
echo "✅ ALL DONE! StillMind is live:"
echo "   → Platform : https://stillmind.civiclens.space"
echo "   → API Docs : https://stillmind.civiclens.space/api/v1/docs"
echo ""
echo "Monitor logs with: docker compose logs -f"
