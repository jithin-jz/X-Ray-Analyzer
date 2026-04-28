# backend/database.py

from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import Request, HTTPException
from backend.config import settings
from backend.utils.jwt_utils import verify_token

client = AsyncIOMotorClient(settings.DATABASE_URL)

# Explicitly use a master database for admin operations and routing
master_db = client["ai_xray_master"]

# dependency (for FastAPI routes that operate globally or on hospitals)
def get_master_db():
    return master_db

# dependency for tenant-specific routes (patients, actual x-rays)
async def get_tenant_db(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    decoded = verify_token(token)
    if not decoded or "hospital_id" not in decoded:
        raise HTTPException(status_code=401, detail="Invalid token or tenant not found")
        
    tenant_id = decoded["hospital_id"]
    return client[f"ai_xray_tenant_{tenant_id}"]


async def check_mongo_connection():
    try:
        await client.admin.command("ping")
        return True
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        return False
