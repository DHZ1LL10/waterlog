from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from datetime import datetime, date
import enum
from app.database import Base


class AuditStatus(str, enum.Enum):
    """Estados del manifiesto de ruta"""
    CREATED = "CREATED"                      # Ruta creada, inventario asignado
    IN_PROGRESS = "IN_PROGRESS"  
    DEBT = "DEBT"            # Chofer en ruta
    PENDING_RECONCILIATION = "PENDING_RECONCILIATION"  # Regresó, esperando validación
    LOCKED_DEBT = "LOCKED_DEBT"              # Descuadre detectado, deuda pendiente
    CLOSED = "CLOSED"                        # Cerrado exitosamente

    


class RouteManifest(Base):
    """
    Manifiesto de Ruta - Tabla principal del sistema.
    Representa el ciclo completo de una ruta diaria.
    """
    __tablename__ = "route_manifests"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Referencias
    driver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    truck_id = Column(Integer, ForeignKey("trucks.id"), nullable=False)
    
    # Fecha
    date = Column(Date, default=date.today, nullable=False, index=True)
    
    # ===== SNAPSHOT DE SALIDA (Check-out) =====
    initial_full_bottles = Column(Integer, nullable=False)
    initial_empty_bottles = Column(Integer, default=0, nullable=False)
    
    checkout_timestamp = Column(DateTime, default=datetime.utcnow)
    checkout_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # ===== SNAPSHOT DE LLEGADA (Check-in) =====
    returned_full_bottles = Column(Integer, nullable=True)
    returned_empty_bottles = Column(Integer, nullable=True)
    reported_damaged = Column(Integer, default=0)
    
    checkin_timestamp = Column(DateTime, nullable=True)
    checkin_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # ===== AUDITORÍA =====
    evidence_url = Column(String(500), nullable=True)  # Path a la foto
    evidence_verified = Column(Integer, default=0)  # Checkbox: ¿Supervisor verificó?
    audit_status = Column(SQLEnum(AuditStatus), default=AuditStatus.CREATED, nullable=False)
    
    # ===== DEUDA =====
    debt_amount = Column(Float, default=0.0)
    
    # Notas del supervisor/admin
    notes = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    driver = relationship("User", foreign_keys=[driver_id])
    truck = relationship("Truck")
    
    def __repr__(self):
        return f"<RouteManifest #{self.id} - Driver:{self.driver_id} - {self.date} - {self.audit_status}>"
    
    @property
    def total_initial(self):
        """Total de activos al inicio"""
        return self.initial_full_bottles + self.initial_empty_bottles
    
    @property
    def total_returned(self):
        """Total de activos al regresar"""
        if self.returned_full_bottles is None or self.returned_empty_bottles is None:
            return None
        return self.returned_full_bottles + self.returned_empty_bottles + self.reported_damaged
    
    @property
    def delta(self):
        """Diferencia de inventario (positivo = faltante)"""
        total_ret = self.total_returned
        if total_ret is None:
            return None
        return self.total_initial - total_ret