# X-Ray Analyzer

An AI-powered X-Ray Analysis backend application built with FastAPI and MongoDB.

## Features (Backend)

- **FastAPI** framework for high-performance API endpoints.
- **MongoDB** integration for database storage.
- Dockerized setup with **Docker Compose** for easy development and deployment.
- Modular architecture with dedicated directories for AI analysis (`dev_ai`), RAG pipelines (`dev_rag`), and core backend services.

## Prerequisites

- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine.

## Project Structure

```
.
├── backend/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── requirements.txt
│   ├── main.py
│   ├── .env
│   ├── dev_ai/          # Directory for AI models and related logic
│   ├── dev_backend/     # Configurations and database connections
│   ├── dev_rag/         # Retrieval-Augmented Generation workflows
│   ├── media/           # Local folder to cache or serve media
│   └── services/        # Additional external services integration logic
└── README.md
```

## Running the Application

This project uses Docker Compose to run the FastApi application and MongoDB server together.

1. **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2. **Build and start the containers**:
    ```bash
    docker compose up --build
    ```
    To run the containers in the background, add the `-d` flag: `docker compose up -d --build`.

3. **Verify it's running**:
    Once the application starts, it will be available at `http://localhost:8000`.
    Visit `http://localhost:8000/docs` to see the automatically generated, interactive API documentation provided by Swagger UI.

4. **Stopping the project**:
    If you want to stop the containers, run:
    ```bash
    docker compose down
    ```

## Environment Variables

Make sure you configure your `.env` file in the `backend` directory appropriately. The `docker-compose.yml` automatically picks it up to inject environments securely.
