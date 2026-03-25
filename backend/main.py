from fastapi import FastAPI
from backend.database import check_mongo_connection

app = FastAPI()

@app.get("/")
async def read_root():
    db_status = "Connected" if await check_mongo_connection() else "Disconnected"
    return {"message": "Welcome to X-Ray Analyzer API", "database": db_status}
