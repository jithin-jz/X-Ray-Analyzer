from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # MongoDB
    DATABASE_URL: str
    DB_NAME: str
    REDIS_URL: str = "redis://localhost:6379/0"

    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str
    SMTP_PASSWORD: str

    # WebAuthn
    RP_ID: str = "localhost"
    RP_NAME: str = "AI XRay App"
    ORIGIN: str = "http://localhost:5173"

    # JWT Security
    # Remove the default to avoid accidental use of a known key in production
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
