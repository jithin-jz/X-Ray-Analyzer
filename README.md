# AI X-Ray Analyzer

A high-performance web application designed for intelligent X-Ray diagnostic analysis. Built with FastAPI and MongoDB, with a focus on Passkey-based security and modular AI integration.

## Features

- **AI Analysis**: Advanced diagnostic processing of medical imaging using RAG and AI pipelines.
- **Biometric Authentication**: WebAuthn-based Passkey integration for secure, passwordless authentication.
- **Identity Verification**: Multi-layered security including OTP verification and Email Magic Links.
- **Configuration Management**: Centralized settings architecture using Pydantic BaseSettings.
- **Containerized Environment**: Orchestrated deployment via Docker Compose for consistent development workflows.

## Project Structure

```text
├── backend/            # FastAPI Application
│   ├── ai/             # AI Analysis logic
│   ├── backend/        # Core settings, routes, and database
│   ├── rag/            # Retrieval workflows
│   └── main.py         # Application Entry point
├── frontend/           # Diagnostic Interface (Vite/React)
└── docs/               # Technical Documentation and Guides
```

## Getting Started

### 1. Environment Configuration
Create a `.env` file in the `backend/` directory and configure the required variables including Database and SMTP credentials.

### 2. Deployment with Docker
Execute the following command in the `backend/` directory to build and start the services:
```bash
docker compose up --build
```
The API services will be available at `http://localhost:8000`.

### 3. API Documentation
The interactive API documentation can be accessed via:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Maintenance and Code Quality

To maintain code standards, execute the following commands within the containerized environment:

- **Code Formatting**: `docker compose exec api black .`
- **Linting and Fixes**: `docker compose exec api ruff check --fix .`

---
*Developed for clinical-grade diagnostic workflows.*
