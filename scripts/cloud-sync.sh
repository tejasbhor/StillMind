#!/bin/bash

# =====================================================
# StillMind — Cloud Sync & Redeploy Script
# Run from: /opt/stillmind
# =====================================================

# 1. FIX OWNERSHIP (Required for OCI)
sudo chown -R $USER:$USER /opt/stillmind
git config --global --add safe.directory /opt/stillmind

# Move to project directory
cd /opt/stillmind

echo "📥 [1/6] Pulling latest code from GitHub..."
git pull origin main

# 2. Sync environment variables (ensures .env has what it needs)
if [ ! -f .env ]; then
    echo "⚠️ .env not found. Copying from example..."
    cp .env.example .env
fi

# 3. Stop services (prevents memory collisions during build)
echo "🛑 [2/6] Stopping containers..."
sudo docker compose down

# 4. Rebuild sequentially to conserve RAM on OCI free-tier
echo "🏗️ [3/6] Rebuilding Backend (FastAPI)..."
sudo docker compose build backend

echo "🏗️ [4/6] Rebuilding Frontend (Next.js Standalone)..."
sudo docker compose build frontend

# 5. Start all services
echo "🚀 [5/6] Starting services..."
sudo docker compose up -d --remove-orphans

# 6. Apply database migrations & Seed data
echo "⌛ Waiting for DB to stabilize..."
sleep 10

echo "🗃️ [6/6] Running migrations..."
sudo docker compose exec -T backend uv run alembic upgrade head

echo "🌱 Seeding institutional data & test accounts..."
sudo docker compose exec -T backend uv run python scripts/seed_all.py

echo ""
echo "✅ ALL DONE! StillMind is live:"
echo "   → Platform : https://stillmind.civiclens.space"
echo "   → API Docs : https://stillmind.civiclens.space/api/v1/docs"
echo ""
echo "Monitor logs with: docker compose logs -f"
