# AI X-Ray Analyzer

A multi-tenant SaaS platform for AI-powered chest X-ray diagnostics. Each hospital gets its own isolated database — zero data overlap between institutions.

## Features

- **Multi-tenant isolation** — database-per-hospital architecture
- **AI analysis** — deep learning model with Grad-CAM visual explanations
- **WebAuthn passkeys** — biometric login (FaceID/TouchID/fingerprint)
- **Role-based access** — doctor, hospital admin, super admin
- **Invite-code onboarding** — admins generate codes, doctors join instantly
- **Usage tracking** — scan limits, user seats, plan management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, Python 3.11 |
| Database | MongoDB (Motor async driver) |
| Cache | Redis |
| Auth | JWT + bcrypt + WebAuthn (FIDO2) + OTP |
| Frontend | React 19, Vite 8, Tailwind CSS 4 |
| Icons | Lucide React |
| Deployment | Docker Compose |

## Architecture

```
ai_xray_master (public DB)     →  users, hospitals, audit_logs
tenant_<hospital_id> (per DB)  →  patients, scans
```

Each request: JWT → extract hospital_id → `client["tenant_<hospital_id>"]` → isolated data access.

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+

### Backend

```bash
cd backend
docker compose up --build
```

API runs at `http://localhost:8000`  
Swagger docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Project Structure

```
├── backend/
│   ├── core/           ← DB, auth, middleware, settings
│   ├── routes/         ← API endpoints (auth, patients, scans, ai, etc.)
│   ├── services/       ← Email service
│   ├── scripts/        ← CLI tools (create_superadmin)
│   ├── templates/      ← Email templates
│   ├── main.py         ← App factory
│   ├── Dockerfile
│   └── docker-compose.yml
├── frontend/
│   ├── src/
│   │   ├── api/        ← API client modules
│   │   ├── components/ ← UI components + Sidebar/Navbar
│   │   ├── context/    ← Auth state
│   │   └── pages/      ← Landing, Auth, Dashboard pages
│   ├── index.html
│   └── package.json
└── .manuals/           ← Project documentation
```

## User Roles

| Role | Can do |
|------|--------|
| **Doctor** | Manage patients, upload X-rays, trigger AI analysis |
| **Hospital Admin** | Everything a doctor can + manage staff, view usage, configure hospital |
| **Super Admin** | Everything + manage all hospitals, view all users, platform stats |

## Registration Flow

1. Hospital admin registers → creates hospital + tenant database
2. Admin gets an invite code
3. Doctors register with the invite code → join the hospital
4. Email OTP verification → account activated
5. Optional: set up passkey for biometric login

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=mongodb://root:example@mongodb:27017/
DB_NAME=ai_xray_master
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
JWT_SECRET_KEY=your-secret-key
REDIS_URL=redis://redis:6379/0
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Useful Commands

```bash
# Create a super admin
docker compose exec api python -m scripts.create_superadmin

# Format code
docker compose exec api black .

# Lint
docker compose exec api ruff check --fix .

# Build frontend for production
cd frontend && npm run build
```

## License

MIT
