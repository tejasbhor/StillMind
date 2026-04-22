#!/bin/bash
# =====================================================
# StillMind — Cloud Sync & Redeploy Script
# Run from: /opt/stillmind
# =====================================================
set -e

cd /opt/stillmind

echo "🔄 [1/5] Pulling latest code..."
git pull origin main

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found. Please create it from .env.production.example"
    exit 1
fi

echo "🏗️ [2/5] Building services (ARM64 optimized)..."
# We build sequentially to save RAM on OCI Free Tier
echo "  - Building Backend API..."
sudo docker compose build backend

echo "  - Building Frontend Dashboard (memory-limited)..."
# Next.js builds can be memory intensive
NODE_OPTIONS="--max-old-space-size=1536" sudo docker compose build frontend

echo "🚀 [3/5] Starting containers..."
sudo docker compose up -d --remove-orphans

echo "🗃️ [4/5] Running database migrations..."
sudo docker compose exec -T api uv run alembic upgrade head

echo "🌱 [5/5] Seeding initial data..."
sudo docker compose exec -T api uv run python scripts/seed_all.py

echo "🧹 Cleaning up old images..."
sudo docker image prune -f

echo ""
echo "✅ ALL DONE! Services are live:"
echo "   → Portal : https://stillmind.civiclens.space"
echo "   → Health : https://stillmind.civiclens.space/api/v1/health"
