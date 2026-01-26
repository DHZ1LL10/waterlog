from sqlalchemy import Column, Integer, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base

class SalesDetail(Base):
    """
    Tabla pivote: Detalle de venta por cliente en una ruta.
    """
    __tablename__ = "sales_details"

    id = Column(Integer, primary_key=True, index=True)
    
    # ¿A qué ruta pertenece esta venta?
    route_id = Column(Integer, ForeignKey("route_manifests.id"), nullable=False)
    
    # ¿A quién se le vendió?
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    
    # Datos de la transacción
    quantity = Column(Integer, nullable=False)      # Cantidad vendida
    unit_price = Column(Float, nullable=False)      # Precio capturado al momento (snapshot)
    subtotal = Column(Float, nullable=False)        # quantity * unit_price

    # Relaciones
    route = relationship("RouteManifest", back_populates="sales_details")
    client = relationship("Client")