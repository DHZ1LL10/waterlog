from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class DebtStatus(str, enum.Enum):
    """Estados de la deuda"""
    PENDING = "PENDING"          # Pendiente de pago
    DEDUCTED = "DEDUCTED"        # Deducido de nómina
    FORGIVEN = "FORGIVEN"        # Perdonado por admin
    DISPUTED = "DISPUTED"        # En disputa, requiere revisión
    PAID = "PAID"                # Pagado en efectivo


class DebtRecord(Base):
    """
    Registro de Deudas.
    Tabla para tracking detallado de deudas generadas por descuadres.
    """
    __tablename__ = "debt_records"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Referencia a la ruta que generó la deuda
    route_manifest_id = Column(Integer, ForeignKey("route_manifests.id"), nullable=False)
    
    # Monto
    amount = Column(Float, nullable=False)
    
    # Estado
    status = Column(SQLEnum(DebtStatus), default=DebtStatus.PENDING, nullable=False)
    
    # Auditoría de resolución
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Notas y justificación
    notes = Column(Text, nullable=True)
    resolution_notes = Column(Text, nullable=True)  # Por qué se perdonó/disputó
    
    # Relationships
    route_manifest = relationship("RouteManifest", backref="debt_records")
    resolved_by = relationship("User", foreign_keys=[resolved_by_user_id])
    
    def __repr__(self):
        return f"<DebtRecord #{self.id} - Route:{self.route_manifest_id} - ${self.amount} - {self.status}>"