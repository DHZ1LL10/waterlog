from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Crear engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    echo=settings.ENVIRONMENT == "development"  # Log SQL queries en dev
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos
Base = declarative_base()


# Dependency para obtener DB session
def get_db():
    """
    Dependency que proporciona una sesión de base de datos.
    Se cierra automáticamente al finalizar el request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()