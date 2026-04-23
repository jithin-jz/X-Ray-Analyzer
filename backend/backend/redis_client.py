import redis
from backend.config import settings

# Initialize Redis client
# decode_responses=True ensures we get strings back from Redis instead of bytes
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

def set_otp(email: str, code: str, ttl: int = 600):
    """Store OTP in Redis with a TTL (default 10 mins)."""
    key = f"otp:{email}"
    redis_client.setex(key, ttl, code)

def get_otp(email: str) -> str:
    """Retrieve OTP from Redis."""
    key = f"otp:{email}"
    return redis_client.get(key)

def delete_otp(email: str):
    """Delete OTP from Redis after verification."""
    key = f"otp:{email}"
    redis_client.delete(key)

def set_challenge(email: str, challenge: bytes, ttl: int = 300):
    """Store WebAuthn challenge in Redis (5 mins TTL)."""
    key = f"challenge:{email}"
    # Redis stores bytes/strings. Challenge is bytes, but we might want to store as hex for simplicity
    redis_client.setex(key, ttl, challenge.hex())

def get_challenge(email: str) -> bytes:
    """Retrieve WebAuthn challenge from Redis."""
    key = f"challenge:{email}"
    challenge_hex = redis_client.get(key)
    if challenge_hex:
        return bytes.fromhex(challenge_hex)
    return None

def delete_challenge(email: str):
    """Delete challenge from Redis."""
    key = f"challenge:{email}"
    redis_client.delete(key)
