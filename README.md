# StillMind Platform 🧠

**StillMind** is a rule-based, explainable mental health triage and resource allocation platform built for educational institutions. The platform normalizes student assessments, computes Composite Risk Indices (CRI), fairly prioritizes waiting students, and intelligently assigns limited counseling slots. 

---

## 🏗 System Architecture (Production OCI Pattern)

StillMind is built for high availability and low-resource environments (specifically Oracle Cloud OCI Free Tier):

- **Frontend**: Next.js 15 App Router (Containerized `standalone` output).
- **Backend API**: FastAPI (Python 3.12) + `uv` + Pydantic (Modular Monolith).
- **Database**: PostgreSQL 16 (Relational schemas + JSONB explainability vectors).
- **Async Queueing**: Redis + ARQ (Async Background Tasks).
- **Reverse Proxy**: Integrated into the **CivicLens Proxy Network** via Caddy.
- **Native Chat**: ASGI Native `python-socketio` framework.

---

## 🚀 Deployment (Oracle Cloud / OCI)

We use a memory-optimized, sequential deployment strategy to maintain stability on low-resource instances.

### 1. Initial Server Setup
If deploying to a fresh OCI instance, run the initialization script to configure Swap, Firewall, and Docker:
```bash
chmod +x scripts/init-server.sh
sudo ./scripts/init-server.sh
```

### 2. Environment Configuration
Create a `.env` file based on the production template:
```bash
cp .env.production.example .env
# Edit .env with your production secrets
```

### 3. Sequential Deployment
Use the deployment script to build and start services one-by-one (prevents memory spikes):
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 4. Database Setup
Apply migrations and seed the initial permissions:
```bash
docker compose exec backend uv run alembic upgrade head
docker compose exec backend uv run python scripts/seed_all.py
```

---

## 🌐 Shared Proxy Integration (Caddy)

StillMind co-exists with CivicLens on a shared OCI instance. To route traffic, we use an **Import Pattern** in the main Caddy config:

1. The main `Caddyfile` imports from `/opt/civiclens/sites/*`.
2. The StillMind config resides in `/opt/civiclens/sites/stillmind`.
3. Traffic is routed via `stillmind.civiclens.space`.

---

## 📚 API Contracts & Documentation
Interactive OpenAPI documentation is automatically hosted at:
👉 **`https://stillmind.civiclens.space/api/v1/docs`**

### Core Modules
* `/api/v1/auth/*` — Institutional Auth & RBAC
* `/api/v1/students/me/*` — Student Progress & Assessments
* `/api/v1/counselors/me/*` — Counselor Triage & Queue
* `/api/v1/admin/*` — Institutional Analytics
* `/socket.io/*` — Real-time Triage Chat

---

## 🛡 Security & Privacy
- **Explainability**: Every risk level (RED/YELLOW/GREEN) is backed by a clinical reasoning vector stored in JSONB.
- **Isolation**: Containers are isolated via the `stillmind_internal` bridge network.
- **RBAC**: Strict role boundaries enforced at the API level (Student, Counselor, Admin).
