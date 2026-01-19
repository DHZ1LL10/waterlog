from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from datetime import datetime
from app.database import Base


class AuditLog(Base):
    """
    Log de Auditoría Inmutable.
    Registra TODAS las acciones sensibles del sistema.
    """
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Timestamp (NO puede ser modificado)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Usuario que realizó la acción
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Acción realizada
    action = Column(String(100), nullable=False, index=True)
    # Ejemplos: "DEBT_FORGIVEN", "MANUAL_OVERRIDE", "ROUTE_CLOSED", "EVIDENCE_UPLOADED"
    
    # Entidad afectada
    entity_type = Column(String(50), nullable=False)  # "RouteManifest", "DebtRecord"
    entity_id = Column(Integer, nullable=False)
    
    # Estado anterior y nuevo (JSON para flexibilidad)
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    
    # Metadata
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    # Notas adicionales
    notes = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<AuditLog #{self.id} - {self.action} by User:{self.user_id} at {self.timestamp}>"