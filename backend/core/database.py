from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from core.config import settings

client: AsyncIOMotorClient = AsyncIOMotorClient(settings.DATABASE_URL)

# Master database — users, hospitals, billing, audit logs
master_db: AsyncIOMotorDatabase = client[settings.DB_NAME]


def get_master_db() -> AsyncIOMotorDatabase:
    """FastAPI dependency — returns the shared master database."""
    return master_db


def get_tenant_database(tenant_id: str) -> AsyncIOMotorDatabase:
    """Returns an isolated database for a specific tenant."""
    return client[f"tenant_{tenant_id}"]


async def check_mongo_connection() -> bool:
    try:
        await client.admin.command("ping")
        return True
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        return False
