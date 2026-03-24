from motor.motor_asyncio import AsyncIOMotorClient
from dev_backend.config import settings

client = AsyncIOMotorClient(settings.database_url)
db = client.get_default_database()

# For a specific database name if needed:
# db = client[settings.database_name]

async def check_mongo_connection():
    try:
        # Replicates ping to check connection
        await client.admin.command('ping')
        return True
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        return False
