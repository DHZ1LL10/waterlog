from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from app.database import Base


class Truck(Base):
    """Modelo de Camioneta/Vehículo"""
    __tablename__ = "trucks"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Identificación
    plate = Column(String(20), unique=True, index=True, nullable=False)
    nickname = Column(String(50), nullable=False)  # "La Blanca", "La Roja"
    brand = Column(String(50), nullable=True)
    model = Column(String(50), nullable=True)
    year = Column(Integer, nullable=True)
    
    # Estado
    is_active = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Truck {self.nickname} - {self.plate}>"