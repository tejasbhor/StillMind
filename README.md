# StillMind

**An institution-grade wellness platform providing transparent, AI-driven decision support for student mental health.**

StillMind bridges the gap between high-volume student wellness data and meaningful counselor intervention. It provides a privacy-first, human-in-the-loop framework for managing student screenings, risk assessments, and resource allocations with full explainability. Every automated insight is backed by a clear rationale, ensuring that technology empowers — rather than replaces — human clinical judgment.

Built as a production-hardened full-stack application spanning a FastAPI backend and a high-performance Next.js 15+ web portal.

---

## Live Demo

The platform is deployed on **Oracle Cloud Infrastructure (OCI ARM64)**, integrated with the global CivicLens bridge network:

| Surface | URL |
|---|---|
| StillMind Portal | [https://stillmind.civiclens.space](https://stillmind.civiclens.space) |
| REST API (Swagger) | [https://stillmind.civiclens.space/api/v1/docs](https://stillmind.civiclens.space/api/v1/docs) |

> **Security Note:** All standard logins require **Mandatory 2FA**. Verification codes are dispatched via the institutional SMTP relay.

---

## Core Pillars

### 🧠 Explainable AI (XAI)
StillMind rejects "black box" algorithms. Every risk score and intervention recommendation is accompanied by a structured rationale, identifying the specific behavioral markers or screening responses that triggered the alert.

### 🛡️ Privacy & Compliance
Designed with institutional data standards in mind. The system implements multi-tenant data isolation, comprehensive audit logging (PRD §12.3), and strict role-based access control (RBAC) to ensure student confidentiality is never compromised.

### 🤝 Human-in-the-Loop
The platform automates the triage and allocation logic to reduce administrative burden, but final intervention decisions remain exclusively in the hands of authorized counselors and clinical leads.

---

## Surface Features

### Student Portal
| Feature | Details |
|---|---|
| **Wellness Screening** | Interactive self-assessment tools with immediate, supportive feedback loops |
| **Secure Chat** | Real-time, encrypted communication with assigned counselors (via Socket.io) |
| **Session Booking** | Seamless scheduling for in-person or virtual wellness check-ins |
| **Google OAuth** | One-tap institutional sign-on with automatic profile synchronization |
| **Biometric Ready** | Built to support local session locking for enhanced personal privacy |

### Counselor Dashboard
| Feature | Details |
|---|---|
| **Risk Monitoring** | Real-time triage list prioritized by AI-detected risk levels and urgency |
| **XAI Assessment** | View detailed rationales behind every system-suggested risk score |
| **Session Management** | Unified interface for tracking appointments, notes, and intervention history |
| **Live Interventions** | Integrated secure messaging for rapid student outreach and support |
| **Automated Allocation** | System-suggested counselor matching based on specialty and workload |

### Admin & Analytics
| Feature | Details |
|---|---|
| **Institutional Logs** | Immutable audit trail of every system action, user access, and status change |
| **Trend Analytics** | System-wide wellness trends, department-level metrics, and resource utilization |
| **System Moderation** | Administrative control over roles, counselor assignments, and risk thresholds |
| **Security Controls** | Configuration of global 2FA policies and institutional SMTP relays |

---

## Repository Structure

```
apps/api/                 FastAPI service, XAI risk engine, async ORM, migrations
apps/web/                 Wellness portal (Next.js 15+ · Tailwind v4 · Framer Motion)
docs/                     Institutional architecture, deployment, and security guides
scripts/                  Dev startup, cloud-sync, and database seeding scripts
docker-compose.yml        Production orchestration (API, Web, DB, Redis)
Caddyfile                 Reverse proxy configuration with auto-TLS
OPERATIONS.md             Quick-reference for deployment and maintenance
DEPLOYMENT.md             Detailed OCI infrastructure and bridge network logic
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.12, FastAPI, SQLAlchemy 2.0 (Async), Alembic |
| **Frontend** | Next.js 15/16, React 19, Tailwind CSS v4, Framer Motion |
| **State Management** | Zustand, TanStack React Query (v5) |
| **Database** | PostgreSQL 16 (Primary storage) |
| **Real-time / Cache** | Redis 7 (OTP, Sessions, Socket.io, Cache) |
| **Reverse Proxy** | Caddy 2 (Integrated with CivicLens bridge network) |
| **CI/CD** | Production-ready Git sync with Alembic auto-migration |
| **Hosting** | Oracle Cloud OCI (ARM64 VM.Standard.A1.Flex) |

---

## Local Development Setup

### Prerequisites

- Python 3.12+ with [uv](https://docs.astral.sh/uv/)
- Node.js 20+ with npm
- Docker (for DB and Redis)

### Step 1 — Infrastructure

```bash
# Start required services
docker compose up -d db redis
```

### Step 2 — Backend Setup

```bash
cd apps/api

# Install dependencies and setup environment
uv sync
cp .env.example .env

# Initialize database and start development server
# Note: This runs migrations and starts uvicorn with reload
uv run uvicorn app.main:app --reload
```

- Interactive API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

**Seed demo data:**
```bash
uv run python scripts/seed_all.py
```

### Step 3 — Frontend Setup

```bash
cd apps/web
npm install
npm run dev    # http://localhost:3000
```

---

## Production Deployment

StillMind runs on a hardened **OCI ARM64 instance**, utilizing a bridge network to share ingress and SSL with the global CivicLens Caddy proxy.

### Operational Quick-Actions
| Action | Command |
|---|---|
| **Update Cloud** | `sudo bash scripts/cloud-sync.sh` (Pulls, Rebuilds, Migrates) |
| **View Logs** | `sudo docker compose logs -f` |
| **DB Migration** | `uv run alembic upgrade head` |

For a deep dive into the OCI configuration, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

---

## Reflections & Learnings

Building StillMind was an exercise in balancing **automation with empathy**. In clinical and educational environments, the "black box" nature of typical AI systems is a liability. 

**XAI is the foundation.** Developing the Risk Engine required moving beyond simple classification toward a system that could explain its own reasoning. This taught us that in wellness tech, the *why* is often more important than the *what*.

**Production hardening on ARM64.** Deploying a modern stack (Next 16, React 19) on OCI ARM instances required careful orchestration of memory limits and container rebuild sequences to ensure high availability on the Always Free tier.

**The "Human-in-the-Loop" requirement.** Engineering for human override meant designing the database and state transitions to handle "proposed" vs "finalized" actions at every layer, a level of complexity often overlooked in standard CRUD apps.

---

## License

Institutional use only. Proprietary software of CivicLens. All rights reserved.

---

*StillMind — empowering those who care with the clarity they deserve.*
