# StillMind

> Mental Health Triage & Resource Allocation System — v1.0

StillMind is a rule-based, explainable mental health triage platform for educational institutions. It collects standardized clinical assessments, computes a Composite Risk Index (CRI), prioritizes students fairly, and allocates limited counseling slots to those who need them most — with a human counselor always in the decision loop.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS v4 |
| Backend | FastAPI (Python) — async SQLAlchemy, Pydantic, Alembic |
| Database | PostgreSQL 16 |
| Queue/Cache | Redis 7 + ARQ |
| Real-time Chat | Socket.IO (python-socketio) |
| Email | SMTP (MailHog dev / SendGrid prod) |

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.12+ with `uv`
- Node.js 20+ with `pnpm`

### 1. Start infrastructure

```bash
docker-compose up -d
```

### 2. Backend

```bash
cd apps/api
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd apps/web
pnpm install
pnpm dev
```

### 4. Services

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| MailHog UI | http://localhost:8025 |

## Roles

| Role | Route | Access |
|---|---|---|
| Student | `/dashboard` | Own assessments, appointments, progress, chat |
| Counselor | `/counselor` | Priority queue, sessions, case notes |
| Admin | `/admin` | System metrics, config, audit logs |

## Four Foundational Principles

1. **Explainability over Black Box** — every decision answers "Why?"
2. **Human-in-the-Loop** — system recommends; counselors decide
3. **Resource Optimization** — maximize impact within slot constraints
4. **Privacy-First** — role-based access; no unnecessary clinical exposure
