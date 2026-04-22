#!/bin/bash
set -e # Exit on error

# =====================================================
# StillMind — Cloud Sync & Redeploy Script
# Optimized for OCI (Oracle Cloud Infrastructure)
# =====================================================

# Color coding for better visibility
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting StillMind Production Update...${NC}"

# 1. PERMISSION SHIELD
# Ensure we own the directory before doing anything
sudo chown -R $USER:$USER /opt/stillmind
git config --global --add safe.directory /opt/stillmind

cd /opt/stillmind

# 2. PULL CODE
echo -e "${GREEN}📥 [1/6] Syncing with GitHub...${NC}"
git fetch origin main
git reset --hard origin/main

# 3. STOP SERVICES
echo -e "${GREEN}🛑 [2/6] Stopping containers...${NC}"
sudo docker compose down --remove-orphans

# 4. REBUILD SERVICES (Sequential to save OCI memory)
echo -e "${GREEN}🏗️ [3/6] Rebuilding Backend (FastAPI)...${NC}"
sudo docker compose build backend

echo -e "${GREEN}🏗️ [4/6] Rebuilding Frontend (Next.js)...${NC}"
sudo docker compose build frontend

# 5. CLEAN UP (Safe Prune)
echo -e "${GREEN}🧹 Cleaning up build artifacts...${NC}"
sudo docker system prune -f

# 6. START SERVICES
echo -e "${GREEN}🚀 [5/6] Starting services...${NC}"
sudo docker compose up -d

# 7. DATABASE HEALTHCHECK
echo -e "${GREEN}⌛ [6/6] Waiting for Database to be ready...${NC}"
MAX_RETRIES=30
COUNT=0
until sudo docker compose exec db pg_isready -U stillmind -d stillmind > /dev/null 2>&1; do
  COUNT=$((COUNT + 1))
  if [ $COUNT -ge $MAX_RETRIES ]; then
    echo -e "${RED}❌ Database failed to start in time.${NC}"
    exit 1
  fi
  echo -n "."
  sleep 2
done
echo -e "\n${GREEN}✅ Database is ready!${NC}"

# 8. APPLY MIGRATIONS
echo -e "${GREEN}🗃️ Applying incremental migrations...${NC}"
if ! sudo docker compose exec backend uv run alembic upgrade head; then
    echo -e "${RED}❌ Migration failed!${NC}"
    echo -e "${YELLOW}Tip: If this is a 'DuplicateObjectError', run:${NC}"
    echo "sudo docker compose exec backend uv run alembic stamp <last_good_revision>"
    exit 1
fi

echo -e "${GREEN}✨ UPDATE COMPLETE! StillMind is live.${NC}"
echo -e "Monitor live logs with: ${YELLOW}docker compose logs -f${NC}"
