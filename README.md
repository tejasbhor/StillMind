# StillMind Platform 🧠

**StillMind** is a rule-based, explainable mental health triage and resource allocation platform built for educational institutions. The platform normalizes student assessments, computes Composite Risk Indices (CRI), fairly prioritizes waiting students, and intelligently assigns limited counseling slots. 

It is designed with three core principles:
1. **Explainability over Black Box**: No hidden AI decisions. Every risk level requires absolute clinical traceability.
2. **Human-in-the-Loop**: Counselors receive smart capacity-matched queues, but retain ultimate override authority over decisions.
3. **Absolute Privacy**: Strict Role-Based Access Control (RBAC) ensuring Admin, Counselor, and Student boundaries.

---

## 🏗 System Architecture (CIVICLENS production pattern)

- **Frontend**: Next.js 15 App Router + TailwindCSS (Multi-stage containerized `standalone` output)
- **Backend API**: FastAPI (Python 3.12) + `uv` + Pydantic (Modular Monolith)
- **Database**: PostgreSQL 16 (Relational schemas + JSONB explainability vectors)
- **Async Queueing**: Redis + ARQ (Async Background Tasks)
- **Reverse Proxy**: Caddy (Zero-config SSL & internal API routing)
- **Native Chat**: ASGI Native `python-socketio` framework

## 🚀 Getting Started (Docker / OCI Deploy)

This project has been fully dockerized for instant scaling across environments. 

### Prerequisites
- Docker Engine & Docker Compose

### 1. Boot up the Container Stack
```bash
docker compose up -d --build
```
This commands spins up:
1. `caddy` (Proxy manager on port 80/443)
2. `frontend` (Next.js Application)
3. `backend` (FastAPI JSON REST API)
4. `db` (Postgres Database)
5. `redis` (KV Store for Queues / Sessions)

### 2. Run Database Migrations
Once the `backend` and `db` are healthy, apply the latest Alembic schema definitions:
```bash
docker compose exec backend uv run alembic upgrade head
```

### 3. Seed Default Test Data
Populate the platform with testing accounts across all three RBAC scopes (Student, Counselor, Admin):
```bash
docker compose exec backend uv run python scripts/seed_all.py
```
*(Check the script file for default credentials).*

---

## 📚 API Contracts & Documentation
Once the Docker stack is running, the interactive OpenAPI JSON endpoints are automatically hosted via Swagger UI at:
👉 **[http://localhost/api/v1/docs](http://localhost/api/v1/docs)**

### Core Monolith Sub-Domains
* `/api/v1/auth/*`
* `/api/v1/students/me/*`
* `/api/v1/counselors/me/*`
* `/api/v1/admin/*`
* `/socket.io/*` (Real-time communications)

## ☁️ Continuous Deployment
The repository relies on GitHub Actions. Commits to the `main` branch dynamically trigger `.github/workflows/deploy.yml` which SSH's directly into the target OCI node to handle rolling updates transparently.
