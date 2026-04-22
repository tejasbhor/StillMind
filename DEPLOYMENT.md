# StillMind — Deployment & Infrastructure Playbook

This document tracks the production state and infrastructure details for the StillMind platform.

## 🚀 Production Status
- **Environment**: Oracle Cloud Infrastructure (OCI)
- **Primary Domain**: [stillmind.civiclens.space](https://stillmind.civiclens.space)
- **API Documentation**: [stillmind.civiclens.space/api/v1/docs](https://stillmind.civiclens.space/api/v1/docs)
- **Last Hardened**: 2026-04-22 (Switched to additive Alembic migrations)

## 🏗️ Infrastructure Architecture
StillMind coexists with the **CivicLens** project on a shared OCI instance.

### Networking & Proxy
- **Reverse Proxy**: A shared Caddy instance (running in the CivicLens namespace) handles SSL/HTTPS.
- **Proxy Configuration**: Located at `/opt/civiclens/sites/stillmind`.
- **Internal Network**: StillMind services are isolated in `stillmind_internal` but join the `civiclens_civiclens_net` to reach the proxy.

### Resource Allocation (Limits)
- **Frontend**: 700MiB RAM
- **Backend (API)**: 500MiB RAM
- **PostgreSQL**: 350MiB RAM
- **Redis**: 100MiB RAM

## 🛠️ Deployment Workflow

### Standard Update (Non-destructive)
To update the site without losing data:
```bash
cd /opt/stillmind
sudo bash scripts/cloud-sync.sh
```

### Database Changes
1.  Locally generate a migration: `uv run alembic revision --autogenerate -m "description"`
2.  Push migration to GitHub.
3.  Run `cloud-sync.sh` on the server.

### Critical Safety Note
**DO NOT** run `scripts/dev_startup.py` on the production server unless you explicitly intend to wipe all user data for a factory reset. The standard `cloud-sync.sh` is now safe and additive.

## 💾 System Maintenance
- **Storage**: The OCI instance has a 50GB boot volume (expandable to 200GB).
- **Cleanup**: Run `sudo docker system prune -f` periodically to maintain disk space.
