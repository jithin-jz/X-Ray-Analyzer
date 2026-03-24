from fastapi import FastAPI
from dev_backend.config import settings

from dev_backend.database import check_mongo_connection

app = FastAPI(title=settings.app_name)

@app.get("/")
async def read_root():
    db_status = "Connected" if await check_mongo_connection() else "Disconnected"
    return {
        "message": "FastAPI running in Docker",
        "debug": settings.debug,
        "database": f"MongoDB - {db_status}"
    }

