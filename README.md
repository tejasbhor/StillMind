# StillMind — Institution-Grade Wellness Platform

StillMind is a privacy-first, human-in-the-loop decision support system designed for educational institutions. It provides a transparent framework for managing student wellness, risk assessments, and counselor allocations with full explainability.

[![Environment: Production](https://img.shields.io/badge/Environment-Production-green?style=flat-square)](https://stillmind.civiclens.space)
[![License: Institutional](https://img.shields.io/badge/License-Institutional-blue?style=flat-square)](#)

---

## ✨ Core Pillars

### 🧠 Explainable AI (XAI)
Every risk assessment and recommendation is accompanied by a clear, evidence-based rationale. StillMind ensures that automated scores never replace human judgment but rather empower it.

### 🛡️ Privacy & Security
- **Data Isolation**: Multi-tenant architecture ensuring institutional data remains siloed.
- **Mandatory 2FA**: Institution-grade security for all standard logins.
- **Audit Logging**: Comprehensive tracking of all administrative and counselor actions.

### 🤝 Human-in-the-Loop
Counselors maintain full control over the final decision-making process. The system automates the triage, while humans finalize the intervention.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS v4, Zustand, Framer Motion.
- **Backend**: FastAPI (Python 3.12), SQLAlchemy (Async), Alembic.
- **Real-time**: Socket.io for integrated secure chat.
- **Storage**: PostgreSQL (Primary), Redis (Session/OTP/Cache).
- **Deployment**: Docker Compose, OCI (Oracle Cloud), Caddy Reverse Proxy.

---

## 🚀 Getting Started

### Local Development
For detailed setup instructions, including environment variables and database seeding, refer to [Local Development Guide](./docs/DEVELOPMENT.md).

1. **Clone & Install**:
   ```bash
   git clone https://github.com/tejasbhor/StillMind.git
   npm install
   ```
2. **Infrastructure**:
   ```bash
   docker compose up -d db redis
   ```
3. **Backend Startup**:
   ```bash
   cd apps/api
   uv run python scripts/dev_startup.py  # Warning: Wipes local data
   uv run uvicorn app.main:app --reload
   ```

---

## ☁️ Production & Operations

StillMind is deployed on a hardened OCI instance, co-existing with the CivicLens infrastructure.

- **Production URL**: [stillmind.civiclens.space](https://stillmind.civiclens.space)
- **API Reference**: [stillmind.civiclens.space/api/v1/docs](https://stillmind.civiclens.space/api/v1/docs)

For operational commands (syncing, logs, migrations), see **[OPERATIONS.md](./OPERATIONS.md)**.
For infrastructure architecture and proxy details, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

---

## 📄 License
Institutional use only. Proprietary software of CivicLens. All rights reserved.
