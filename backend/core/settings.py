from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # MongoDB
    DATABASE_URL: str
    DB_NAME: str = "ai_xray_master"
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
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # Short-lived access token
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Platform
    APP_NAME: str = "AI X-Ray Analyzer"
    API_VERSION: str = "v1"
    DEBUG: bool = False

    # Multi-tenancy (subdomain routing)
    # BASE_DOMAIN is the apex domain used to derive tenant subdomains.
    # In dev: "localhost" → tenants live at <slug>.localhost:5173
    # In prod: "domain.com" → tenants live at <slug>.domain.com
    BASE_DOMAIN: str = "localhost"
    # Optional explicit scheme + port for building tenant URLs in API responses.
    # e.g. TENANT_URL_SCHEME=https, TENANT_URL_PORT="" (default https://slug.domain.com)
    TENANT_URL_SCHEME: str = "http"
    TENANT_URL_PORT: str = "5173"  # frontend port for dev; "" for prod
    # Subdomains that may NOT be assigned to a tenant.
    RESERVED_SUBDOMAINS: str = (
        "www,api,app,admin,dashboard,mail,smtp,ftp,blog,docs,help,support,"
        "status,assets,static,cdn,auth,login,signup,register,public,health"
    )

    # File Storage
    STORAGE_BACKEND: str = "local"  # "local" | "s3" | "minio"
    STORAGE_BUCKET: str = "xray-uploads"
    S3_ENDPOINT: str = ""
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""

    @property
    def reserved_subdomains_set(self) -> set[str]:
        return {
            s.strip().lower()
            for s in self.RESERVED_SUBDOMAINS.split(",")
            if s.strip()
        }

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
