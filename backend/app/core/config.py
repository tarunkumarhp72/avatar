from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Avatar"
    app_version: str = "0.1.0"
    debug: bool = False
    database_url: str
    redis_url: str
    jwt_secret_key: str = Field(min_length=32)
    jwt_algorithm: str = "HS256"
    access_token_ttl_minutes: int = 15
    refresh_token_ttl_days: int = 30
    allowed_origins: list[str]
    supabase_url: str
    supabase_service_key: str
    storage_bucket_media: str
    storage_bucket_kyc: str
    razorpay_key_id: str
    razorpay_key_secret: str
    sms_provider_key: str = ""
    fcm_server_key: str = ""
    otp_rate_limit_per_hour: int = 5
    otp_max_attempts: int = 5

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
