# backend/database.py

from motor.motor_asyncio import AsyncIOMotorClient

from backend.config import settings

client = AsyncIOMotorClient(settings.DATABASE_URL)

# explicitly select DB (better than get_default_database)
db = client[settings.DB_NAME]


# dependency (for FastAPI routes)
def get_db():
    return db


async def check_mongo_connection():
    try:
        await client.admin.command("ping")
        return True
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        return False
