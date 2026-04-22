#!/bin/bash

# =====================================================
# StillMind — Cloud Sync & Redeploy Script
# Run from: /opt/stillmind
# =====================================================

# 1. FIX OWNERSHIP (Required for OCI)
sudo chown -R $USER:$USER /opt/stillmind
git config --global --add safe.directory /opt/stillmind

cd /opt/stillmind

# 2. Pull latest code
echo "📥 [1/6] Pulling latest code from GitHub..."
git fetch origin main
git reset --hard origin/main

# 3. Ensure .env exists
if [ ! -f .env ]; then
    echo "⚠️ .env not found. Creating from example..."
    cp .env.example .env
    echo "❌ PLEASE EDIT /opt/stillmind/.env with your production secrets then re-run!"
    exit 1
fi

# 4. Stop StillMind containers
echo "🛑 [2/6] Stopping containers..."
sudo docker compose down --remove-orphans

# 5. Rebuild sequentially to conserve RAM
echo "🏗️ [3/6] Rebuilding Backend (FastAPI)..."
sudo docker compose build backend

echo "🏗️ [4/6] Rebuilding Frontend (Next.js Standalone)..."
sudo docker compose build frontend

# 6. Start services
echo "🚀 [5/6] Starting services..."
sudo docker compose up -d

# 7. Wait for DB to be ready
echo "⌛ Waiting for DB to stabilize..."
until sudo docker compose exec db pg_isready -U stillmind -d stillmind > /dev/null 2>&1; do
  sleep 2
done

# 8. Fresh Start (Mirrors Local working environment)
echo "🗃️ [6/6] Initializing Database (Fresh Start)..."
# We run your dev_startup.py which drops everything, creates tables, and seeds data
sudo docker compose exec backend uv run python scripts/dev_startup.py

echo "✅ ALL DONE! StillMind is live:"
echo "   → Platform : https://stillmind.civiclens.space"
echo "   → API Docs : https://stillmind.civiclens.space/api/v1/docs"
echo ""
echo "Monitor logs with: docker compose logs -f"
