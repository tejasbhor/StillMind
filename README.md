# StillMind

StillMind is a privacy-first, human-in-the-loop decision support system designed for educational institutions to manage student wellness and risk assessments with transparency and explainability.

## ✨ Core Features
- **Intelligent Risk Scoring**: Transparent assessment of student wellness factors.
- **Privacy-First Architecture**: Institutional data remains isolated and secure.
- **Explainable AI**: Every recommendation comes with clear, actionable rationale.
- **Integrated Chat**: Seamless communication between students, counselors, and administrators.

## 🚀 Getting Started

### Local Development
1. **Clone the repository**:
   ```bash
   git clone https://github.com/tejasbhor/StillMind.git
   ```
2. **Start Infrastructure**:
   ```bash
   docker compose up -d db redis
   ```
3. **Initialize & Seed (Backend)**:
   ```bash
   cd apps/api
   uv run python scripts/dev_startup.py
   ```
4. **Run Frontend**:
   ```bash
   cd apps/web
   npm run dev
   ```

## 🛠️ Production & Ops
For technical details regarding the OCI deployment, networking, and maintenance, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 📄 License
Institutional use only. All rights reserved.
