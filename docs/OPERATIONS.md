# 🛠️ StillMind Operations Guide

This document contains quick-reference commands for development, deployment, and infrastructure management.

## ⚡ Quick Actions

### 1. Local Development ➔ Production Sync
The standard workflow for updating the platform:
1.  **Develop & Test** locally.
2.  **Commit & Push**:
    ```bash
    git add .
    git commit -m "feat: your description"
    git push origin main
    ```
3.  **Sync to Cloud**:
    ```bash
    ssh sm-prod # Or your specific SSH command
    cd /opt/stillmind
    sudo bash scripts/cloud-sync.sh
    ```

### 2. Monitoring Logs
Check real-time production logs across all services:
```bash
sudo docker compose logs -f
```
Specific service logs:
```bash
sudo docker compose logs -f backend
sudo docker compose logs -f frontend
```

### 3. Database Management
**Generate Migration (Local)**:
```bash
cd apps/api
uv run alembic revision --autogenerate -m "description"
```

**Stamp Database (Fix DuplicateObjectError)**:
If a migration fails on the server due to an out-of-sync revision:
```bash
sudo docker compose exec backend uv run alembic stamp <revision_id>
```

**Access DB Shell (Remote)**:
```bash
sudo docker compose exec db psql -U stillmind -d stillmind
```

---

## ☁️ Infrastructure Details

### Server & SSH
- **Provider**: Oracle Cloud Infrastructure (OCI)
- **User**: `ubuntu`
- **Root Directory**: `/opt/stillmind`

### Networking (Reverse Proxy)
StillMind sits behind a **Global Caddy Proxy** managed by the CivicLens infrastructure.
- **Proxy Config Path**: `/opt/civiclens/sites/stillmind`
- **Internal Network**: StillMind containers communicate on the `civiclens_civiclens_net` bridge to bridge the gap between the StillMind stack and the global proxy.
- **SSL**: Automated via Let's Encrypt through the shared Caddy instance.

### Service Allocation
- **API**: [stillmind.civiclens.space/api/v1](https://stillmind.civiclens.space/api/v1)
- **Web**: [stillmind.civiclens.space](https://stillmind.civiclens.space)
- **Redis**: Isolated on `stillmind_redis:6379`.

---

## 🛡️ Security & 2FA
- **Mandatory 2FA**: Enabled for all standard email/password logins.
- **Bypass**: Google OAuth logins are trusted and bypass the internal 2FA check.
- **SMTP**: Configured for Gmail Implicit TLS (Port 465). If emails stop sending, check the App Password in the `.env`.

---

## 🧹 System Health
- **Disk Cleanup**: `sudo docker system prune -f` (Run weekly)
- **Memory Monitoring**: `docker stats` (Monitor frontend/backend limits)
