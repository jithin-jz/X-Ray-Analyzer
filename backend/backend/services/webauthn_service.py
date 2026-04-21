from backend.config import settings

RP_ID = settings.RP_ID
RP_NAME = settings.RP_NAME
ORIGIN = settings.ORIGIN

# In-memory store (use DB or Redis later)
challenge_store = {}
