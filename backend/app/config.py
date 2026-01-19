from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Configuración de la aplicación usando Pydantic Settings"""
    
    # Entorno
    ENVIRONMENT: str = "development"
    
    # Base de datos
    DATABASE_URL: str = "sqlite:///./data/waterlog.db"
    
    # Seguridad
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 horas
    
    # Planta
    PLANT_ID: int = 1
    PLANT_NAME: str = "Planta Centro"
    
    # Precios
    BOTTLE_PRICE: float = 60.00
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost"
    ]
    
    # Archivos
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 5242880  # 5MB
    
    # Logs
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Instancia global de settings
settings = Settings()


# Crear directorios necesarios
os.makedirs("data", exist_ok=True)
os.makedirs("uploads", exist_ok=True)
os.makedirs("logs", exist_ok=True)