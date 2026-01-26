from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Client(Base):
    """
    Modelo de Cliente / Punto de Entrega.
    Permite asignar precios especiales y direcciones.
    """
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)   # Ej: "Ingenio La Gloria"
    address = Column(String, nullable=True)             # Ej: "Carr. Federal Km 20"
    
    # Lógica de Precios:
    # - Si es NULL (None): El sistema usará el precio global configurado.
    # - Si tiene valor (ej: 45.00): El sistema forzará este precio.
    special_price = Column(Float, nullable=True)
    
    # Control de actividad (Borrado lógico)
    is_active = Column(Boolean, default=True)
    
    # Auditoría de creación
    created_at = Column(DateTime(timezone=True), server_default=func.now())