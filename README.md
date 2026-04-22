# StillMind

Institution-grade mental health infrastructure for universities. StillMind connects high-volume student wellness data to meaningful counselor action through a privacy-first, human-in-the-loop architecture — where every automated decision is auditable, every risk score is explainable, and no intervention is finalized without a human.

Built on a production-hardened stack: FastAPI backend, async ORM, and a Next.js 15+ portal deployed on Oracle Cloud Infrastructure (ARM64).

---

## Deployment

Hosted on OCI ARM64, behind the CivicLens Caddy bridge network with auto-TLS.

| Surface | URL |
|---|---|
| StillMind Portal | https://stillmind.civiclens.space |
| REST API (Swagger) | https://stillmind.civiclens.space/api/v1/docs |

> **Note:** All accounts require mandatory 2FA. Demo accounts have been removed to preserve institutional integrity. OTP codes are dispatched via the institutional SMTP relay.

---

## Architecture

### Explainable AI

Every risk score produced by the system includes a structured rationale: which behavioral markers or screening responses triggered it, and why. No black boxes. In a clinical context, the reasoning behind a recommendation is as important as the recommendation itself.

### Privacy & Compliance

Multi-tenant data isolation, immutable audit logging (per PRD §12.3), and strict role-based access control (RBAC) throughout. Student data does not cross role boundaries under any circumstance.

### Human-in-the-Loop

Automated triage reduces administrative overhead. Final intervention decisions — always — remain with authorized counselors and clinical leads. The system proposes; the clinician decides.

---

## Features

### Student Portal

| Feature | Description |
|---|---|
| Wellness Screening | Self-assessment tools with immediate, supportive feedback |
| Secure Messaging | Real-time encrypted communication with assigned counselors via Socket.io |
| Session Booking | Scheduling for in-person and virtual check-ins |
| Google OAuth | Institutional single sign-on with automatic profile sync |
| Biometric Lock | Local session locking for enhanced personal privacy |

### Counselor Dashboard

| Feature | Description |
|---|---|
| Risk Monitoring | Real-time triage queue prioritized by AI-assessed urgency |
| XAI Rationale | Full breakdown of every system-suggested risk score |
| Session Management | Unified view of appointments, clinical notes, and intervention history |
| Live Messaging | Integrated secure outreach for rapid student contact |
| Automated Allocation | Counselor matching based on specialty and current workload |

### Admin & Analytics

| Feature | Description |
|---|---|
| Audit Logs | Immutable trail of every system action, access event, and status change |
| Trend Analytics | Institution-wide wellness metrics, department breakdowns, resource utilization |
| System Moderation | Role management, counselor assignments, risk threshold configuration |
| Security Controls | Global 2FA policy and SMTP relay configuration |

---

## Repository Structure

```
apps/api/             FastAPI service — XAI risk engine, async ORM, Alembic migrations
apps/web/             Next.js 15+ portal — Tailwind v4, Framer Motion
docs/                 Architecture, deployment, and security documentation
scripts/              Dev startup, cloud sync, and database seeding
docker-compose.yml    Production orchestration (API, Web, PostgreSQL, Redis)
Caddyfile             Reverse proxy with auto-TLS
OPERATIONS.md         Deployment quick-reference
DEPLOYMENT.md         Full OCI infrastructure and bridge network documentation
```

---

## Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0 (async), Alembic |
| Frontend | Next.js 15/16, React 19, Tailwind CSS v4, Framer Motion |
| State | Zustand, TanStack Query v5 |
| Database | PostgreSQL 16 |
| Cache / Realtime | Redis 7 (sessions, OTP, Socket.io, query cache) |
| Reverse Proxy | Caddy 2 (CivicLens bridge network) |
| Hosting | Oracle Cloud OCI — VM.Standard.A1.Flex (ARM64, Always Free) |

---

## Local Development

### Prerequisites

- Python 3.12+ with [uv](https://docs.astral.sh/uv/)
- Node.js 20+
- Docker (for PostgreSQL and Redis)

### 1. Start infrastructure

```bash
docker compose up -d db redis
```

### 2. Backend

```bash
cd apps/api
uv sync
cp .env.example .env
uv run uvicorn app.main:app --reload
```

API docs available at `http://localhost:8000/api/v1/docs`.

Seed development data:

```bash
uv run python scripts/seed_all.py
```

### 3. Frontend

```bash
cd apps/web
npm install
npm run dev
```

Portal available at `http://localhost:3000`.

---

## Production Operations

| Action | Command |
|---|---|
| Deploy update | `sudo bash scripts/cloud-sync.sh` — pulls, rebuilds, migrates |
| Stream logs | `sudo docker compose logs -f` |
| Run migrations | `uv run alembic upgrade head` |

Full OCI configuration documented in [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Engineering Notes

**XAI is a first-class concern, not an afterthought.** Building the risk engine required moving well past classification into a system that can surface its own reasoning. That constraint shaped every data model and API contract in the backend.

**ARM64 on the Always Free tier is not trivial.** Running Next.js 16 and React 19 in Docker on an OCI A1 instance required careful memory budgeting and a deliberate container rebuild sequence to maintain stability without paid compute.

**"Human-in-the-loop" has a cost.** Properly supporting human override meant distinguishing `proposed` from `finalized` states at every layer of the database and state machine — not just at the UI. That's complexity that most CRUD applications never encounter.

---

## License

Proprietary software of CivicLens. Institutional use only. All rights reserved.
