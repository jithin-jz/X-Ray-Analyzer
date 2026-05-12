"""
Application lifecycle events (startup / shutdown).
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from core.database import check_connection, master_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Runs on app startup and shutdown."""

    # ── Startup ──
    if await check_connection():
        print("✅ MongoDB connected")

        # Create indexes on shared collections
        await master_db.users.create_index("email", unique=True)
        await master_db.hospitals.create_index("hospital_id", unique=True)
        await master_db.hospitals.create_index("invite_code")
    else:
        print("❌ MongoDB connection failed — check DATABASE_URL")

    yield

    # ── Shutdown ──
    print("🔒 Shutting down...")
