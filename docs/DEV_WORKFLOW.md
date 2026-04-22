# 🚀 StillMind Development Workflow

This guide details the streamlined "Local-to-Cloud" development cycle used for StillMind.

## 💻 Daily Development Cycle

### 1. Local Development
Work on your feature or fix in the local environment.
- **Backend**: `uv run uvicorn app.main:app --reload` (in `apps/api`)
- **Frontend**: `npm run dev` (in `apps/web`)

### 2. Database Changes (If any)
If you changed any models, generate a migration:
```bash
cd apps/api
uv run alembic revision --autogenerate -m "describe your changes"
```

### 3. Push to GitHub
When ready to deploy, consolidate your changes:
```bash
git add .
git commit -m "feat: your descriptive message"
git push origin main
```

### 4. Deploy to OCI (Cloud)
Sync your production server with the latest code:
```bash
# Connect to your Oracle Cloud instance
ssh sm-prod

# Navigate to the project and sync
cd /opt/stillmind
sudo bash scripts/cloud-sync.sh
```

---

## 🛠️ Quick Commands Cheat Sheet

| Action | Command |
2FA | `ssh sm-prod` |
| **Sync Cloud** | `sudo bash scripts/cloud-sync.sh` |
| **View Cloud Logs** | `sudo docker compose logs -f` |
| **Reset/Seed DB** | `sudo docker compose exec backend uv run python scripts/seed_all.py` |
| **Check Health** | `curl https://stillmind.civiclens.space/api/v1/docs` |

## 🔑 Key SSH Details
The production instance is hosted on **OCI ARM64**.
- **Host Alias**: `sm-prod` (Defined in your `~/.ssh/config`)
- **User**: `ubuntu`
- **Path**: `/opt/stillmind`

## 🛡️ Organization Logic
- **Student Domain**: `@mssu.ac.in`
- **Admin Access**: Your personal email (`tejasbhor203@gmail.com`) is bypassed for Google Login but still requires 2FA for manual login.
