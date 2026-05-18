from pathlib import Path
from typing import List, Union, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, validator

BASE_DIR = Path(__file__).resolve().parents[2]
# Forçar caminho absoluto para evitar confusão entre diretórios
SQLITE_PATH = BASE_DIR / "sql_app.db"
UPLOADS_PATH = BASE_DIR / "uploads"

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "E-Teledermato"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    DATABASE_URL: str = f"sqlite:///{SQLITE_PATH.as_posix()}"
    UPLOAD_DIR: str = str(UPLOADS_PATH)

    # JWT
    SECRET_KEY: str = "your-secret-key-here"  # CHANGE THIS IN PRODUCTION
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # Anthropic
    ANTHROPIC_API_KEY: Optional[str] = None
    
    # Groq
    GROQ_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
