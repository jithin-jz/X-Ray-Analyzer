# AI X-Ray Analyzer

> Multi-tenant SaaS platform for AI-powered chest X-ray diagnostics. Each hospital operates in a fully isolated environment with its own database, staff, and patient records.

---

## Overview

AI X-Ray Analyzer enables hospitals to upload chest X-ray images and receive instant AI-driven diagnostic predictions with visual explanations (Grad-CAM heatmaps). The platform is built as a multi-tenant system where every hospital gets complete data isolation — separate databases, independent user management, and per-tenant usage controls.

---

## Key Features

- **Database-per-tenant isolation** — each hospital's data lives in its own MongoDB instance
- **AI-powered analysis** — deep learning model with Grad-CAM visual explanations
- **WebAuthn passkey authentication** — biometric login (FaceID, TouchID, fingerprint)
- **Role-based access control** — Doctor, Hospital Admin, Super Admin
- **Invite-code onboarding** — admins generate codes, doctors join instantly
- **Usage metering** — scan limits, user seats, and plan management per hospital
- **Audit logging** — every authenticated request is logged with tenant context

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        MongoDB                                │
├──────────────────────────────────────────────────────────────┤
│  ai_xray_master (shared)    │  tenant_<id> (per hospital)    │
│  ├── users                  │  ├── patients                  │
│  ├── hospitals              │  └── scans                     │
│  └── audit_logs             │                                │
└──────────────────────────────────────────────────────────────┘
```

**Request flow:** JWT → extract `hospital_id` → resolve `tenant_<hospital_id>` database → isolated data access.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| API | FastAPI (Python 3.11) |
| Database | MongoDB with Motor (async) |
| Cache & Sessions | Redis |
| Authentication | JWT + bcrypt + WebAuthn/FIDO2 + Email OTP |
| Frontend | React 19, Vite, Tailwind CSS 4 |
| Containerization | Docker Compose |

---

## Project Structure

```
├── backend/
│   ├── core/           Database, auth, middleware, config
│   ├── routes/         API endpoints (domain-based modules)
│   ├── services/       Shared services (email)
│   ├── scripts/        CLI utilities
│   ├── templates/      Email templates
│   ├── main.py         Application factory
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── frontend/
│   ├── src/
│   │   ├── api/        API client modules
│   │   ├── components/ Reusable UI components
│   │   ├── context/    Global state (auth)
│   │   └── pages/      Route-level page components
│   ├── index.html
│   └── package.json
│
├── .github/            CI workflow + PR template
├── .manuals/           Project documentation
├── CONTRIBUTING.md     Team workflow guide
└── LICENSE             MIT
```

---

## User Roles

| Role | Capabilities |
|------|-------------|
| **Doctor** | Manage patients, upload X-rays, trigger AI analysis |
| **Hospital Admin** | All doctor capabilities + manage staff, view usage, configure hospital |
| **Super Admin** | Platform-wide oversight — manage all hospitals and users |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch naming, commit conventions, and the pull request workflow.

---

## License

This project is licensed under the [MIT License](LICENSE).
