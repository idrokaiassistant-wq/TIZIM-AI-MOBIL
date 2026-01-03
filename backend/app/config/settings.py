from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Application
    app_name: str = "Tizim AI API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Database
    # Supports both SQLite and PostgreSQL
    # PostgreSQL format: postgresql://user:password@host:port/database
    # Railway PostgreSQL: automatically provided via DATABASE_URL environment variable
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./tizim_ai.db")
    
    # JWT
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours
    
    # CORS
    # Parse CORS origins from environment variable or use defaults
    # Format: comma-separated URLs
    _cors_origins_str: Optional[str] = os.getenv(
        "CORS_ORIGINS", 
        "http://localhost:5173,http://localhost:3000"
    )
    
    @property
    def cors_origins(self) -> list[str]:
        """Parse CORS origins from environment variable"""
        if self._cors_origins_str:
            # Split by comma and strip whitespace
            origins = [origin.strip() for origin in self._cors_origins_str.split(",")]
            # Filter out empty strings
            return [origin for origin in origins if origin]
        return ["http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

