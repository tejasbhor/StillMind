# StillMind — Local Development Guide

This guide details how to set up the StillMind development environment locally.

## 📋 Prerequisites
- **Python 3.12+** (Managed by `uv`)
- **Node.js 20+** (Managed by `npm`)
- **Docker & Docker Compose** (For infrastructure)

---

## 🛠️ Initial Setup

1. **Start Infrastructure Services**:
   StillMind requires PostgreSQL and Redis.
   ```bash
   docker compose up -d db redis
   ```

2. **Backend Configuration**:
   - Navigate to the API directory: `cd apps/api`
   - Copy the environment example: `cp .env.example .env`
   - Install dependencies: `uv sync`
   - **Warning**: The startup script below wipes and re-seeds the database.
     ```bash
     uv run python scripts/dev_startup.py
     ```

3. **Frontend Configuration**:
   - Navigate to the Web directory: `cd apps/web`
   - Install dependencies: `npm install`
   - Copy environment example: `cp .env.example .env.local`

---

## 🚀 Running the Platform

### Option 1: Multi-Terminal (Recommended)
- **API**: `cd apps/api && uv run uvicorn app.main:app --reload --port 8000`
- **Web**: `cd apps/web && npm run dev`

### Option 2: Root Scripts (Convenience)
From the project root:
- **Run Web**: `npm run dev`
- **Build All**: `npm run build`

---

## 🧪 Database Migrations
StillMind uses **Alembic** for migrations.

- **Create a new migration**:
  ```bash
  cd apps/api
  uv run alembic revision --autogenerate -m "add feature name"
  ```
- **Apply migrations**:
  ```bash
  uv run alembic upgrade head
  ```

---

## 🛡️ Authentication Testing
- **Google OAuth**: Requires a valid Client ID and Secret in `.env`. The callback URL must be registered in the Google Cloud Console.
- **2FA**: Locally, the 2FA codes are printed to the console if SMTP is not configured, or sent to the mail-server defined in `SMTP_HOST`.
