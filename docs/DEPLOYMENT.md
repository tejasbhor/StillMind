# StillMind — Deployment & Infrastructure Playbook

This document details the production architecture, networking, and reverse-proxy configuration for StillMind on the OCI (Oracle Cloud) environment.

## 🏗️ System Architecture

StillMind coexists with **CivicLens** on a shared instance. While StillMind has its own isolated Docker stack, it leverages the global CivicLens infrastructure for traffic routing and SSL termination.

### 🌐 Networking & Proxying

The entry point for all traffic is a **Global Caddy Instance** running in the CivicLens namespace.

1.  **Traffic Flow**: 
    `Client ➔ HTTPS (443) ➔ Global Caddy ➔ Internal Bridge ➔ StillMind Stack`
2.  **Caddy Configuration**:
    The reverse proxy logic for StillMind is defined at `/opt/civiclens/sites/stillmind` on the OCI instance.
3.  **Bridge Network**:
    StillMind containers are attached to the `civiclens_civiclens_net` network. This allows the global Caddy container to reach the StillMind `backend` and `frontend` services by name.

### 📦 Service Orchestration

Services are managed via `docker-compose.yml`. 

- **Frontend**: Next.js optimized production build (Node 20-alpine).
- **Backend**: FastAPI running via Uvicorn (managed by `uv`).
- **Database**: PostgreSQL 16 with a persistent Docker volume.
- **Redis**: Redis 7-alpine used for session management, OTP storage (2FA), and caching.

---

## 🛠️ Operational Workflows

### 1. Local-to-Cloud Sync
The production server uses a "Pull & Rebuild" model.
- **Trigger**: `sudo bash scripts/cloud-sync.sh`
- **Actions**: Pulls from `main`, stops services, sequentially rebuilds containers (to manage memory pressure), and applies incremental database migrations via Alembic.

### 2. Database Migrations
Migrations are **Local-First**:
1.  Generate migration locally using `alembic revision --autogenerate`.
2.  Push the resulting file in `apps/api/alembic/versions/` to GitHub.
3.  The `cloud-sync.sh` script automatically detects and applies new migrations using `alembic upgrade head`.

---

## 🛡️ Production Hardening

- **2FA**: Mandatory for all email/password logins. Codes are stored in Redis with a 5-minute TTL.
- **Environment Variables**: Managed via a `.env` file on the server (never committed to git).
- **Resource Limits**: 
  - Each service has explicit memory limits (defined in `docker-compose.yml`) to prevent OCI OOM (Out of Memory) kills.
- **SMTP Connectivity**: Uses port 465 with Implicit TLS for maximum reliability from the OCI network.

---

## 📈 Monitoring & Maintenance

- **Logs**: `sudo docker compose logs -f`
- **Stats**: `docker stats` (Monitor memory/CPU usage)
- **Disk**: `sudo docker system prune -f` (Crucial for small OCI boot volumes)
- **Health**: Check the API docs at `/api/v1/docs` to verify backend connectivity.
