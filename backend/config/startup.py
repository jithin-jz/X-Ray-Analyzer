from contextlib import asynccontextmanager

from fastapi import FastAPI

from config.database import check_mongo_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # ── Startup ──
    connected = await check_mongo_connection()
    if connected:
        print("✅ MongoDB connected")
    else:
        print("❌ MongoDB connection failed — check DATABASE_URL")

    yield

    # ── Shutdown ──
    print("🔒 Shutting down gracefully...")
