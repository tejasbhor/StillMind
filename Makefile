# StillMind Development Scripts
# Prerequisites: Docker Desktop running

.PHONY: help dev-db dev-backend dev-frontend fresh reset status

help:
	@echo "StillMind Local Development Commands"
	@echo ""
	@echo "  make dev-db       - Start Docker db & redis only"
	@echo "  make dev-reset   - Reset database (drop, create, seed)"
	@echo "  make dev-backend - Run backend locally with hot-reload"
	@echo "  make dev-frontend - Run frontend locally with hot-reload"
	@echo ""
	@echo "Usage:"
	@echo "  Terminal 1: make dev-backend"
	@echo "  Terminal 2: make dev-frontend"

# Start only database services from Docker
dev-db:
	docker compose up -d db redis

# Reset database: drop all tables, create fresh, seed data
dev-reset:
	docker compose exec backend uv run python scripts/dev_startup.py

# Start backend with hot-reload (connects to Docker db/redis)
dev-backend:
	@echo "Starting backend..."
	@echo "DATABASE_URL: postgresql+asyncpg://stillmind:stillmind_secret@localhost:5432/stillmind"
	@echo "REDIS_URL: redis://localhost:6379/0"
	cd apps/api && uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Start frontend with hot-reload
dev-frontend:
	@echo "Starting frontend..."
	cd apps/web && npm run dev

# Show Docker status
status:
	docker compose ps