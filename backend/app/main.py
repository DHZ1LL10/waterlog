from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from loguru import logger
import time

from app.config import settings
from app.database import engine, Base

# --- IMPORTANTE: Importar TODOS los modelos para que create_all los detecte ---
from app.models.user import User
from app.models.truck import Truck 
from app.models.route_manifest import RouteManifest
from app.models.audit_log import AuditLog
from app.models.debt_record import DebtRecord # También vi este archivo en tu foto
# Routers
from app.api.v1 import auth, reports, routes, resources

# Configurar logger
logger.add(
    "logs/waterlog_{time}.log",
    rotation="1 day",
    retention="30 days",
    level=settings.LOG_LEVEL
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Contexto de inicio y cierre de la aplicación"""
    # Startup
    logger.info(f"Iniciando WaterLog - Planta {settings.PLANT_ID}")
    logger.info(f"Entorno: {settings.ENVIRONMENT}")
    
    # Crear tablas si no existen (Aquí se crea 'audit_logs')
    Base.metadata.create_all(bind=engine)
    logger.info("Base de datos inicializada y tablas verificadas")
    
    yield
    
    # Shutdown
    logger.info("Cerrando WaterLog")


# Inicializar FastAPI
app = FastAPI(
    title="WaterLog API",
    description="Sistema de Gestión de Rutas para Purificadora",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# --- CORS (Configuración Unificada) ---
origins = [
    "http://localhost:3000",
    "http://localhost:3001",      # Frontend Docker
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "*"                           # Comodín para desarrollo
]

# Si tienes orígenes en settings, los agregamos también
if isinstance(settings.BACKEND_CORS_ORIGINS, list):
    origins.extend(settings.BACKEND_CORS_ORIGINS)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["auth"])
app.include_router(routes.router, prefix=f"{settings.API_V1_PREFIX}/routes", tags=["routes"])
app.include_router(reports.router, prefix=f"{settings.API_V1_PREFIX}/reports", tags=["reports"])
app.include_router(resources.router, prefix=f"{settings.API_V1_PREFIX}/resources", tags=["resources"])

# Health check
@app.get("/health", tags=["system"])
async def health_check():
    """Health check endpoint para Docker"""
    return {
        "status": "healthy",
        "plant_id": settings.PLANT_ID,
        "environment": settings.ENVIRONMENT
    }

# Root endpoint
@app.get("/", tags=["system"])
async def root():
    """Endpoint raíz con información del sistema"""
    return {
        "message": "WaterLog API",
        "version": "1.0.0",
        "plant_id": settings.PLANT_ID,
        "plant_name": settings.PLANT_NAME,
        "docs": "/docs"
    }

# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Error no manejado: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Error interno del servidor",
            "path": str(request.url)
        }
    )