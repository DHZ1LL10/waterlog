from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.database import get_db
from app.models.client import Client
from app.models.user import User
from app.api.v1.auth import get_current_active_user

router = APIRouter()

# --- SCHEMAS (Reglas de datos) ---
class ClientCreate(BaseModel):
    name: str  # <--- CORREGIDO: "str" en minúscula
    address: Optional[str] = None
    special_price: Optional[float] = None # Enviar null o 0 para usar precio global

class ClientResponse(BaseModel):
    id: int
    name: str
    address: Optional[str] = None
    special_price: Optional[float] = None
    is_active: bool

    class Config:
        from_attributes = True

# --- ENDPOINTS ---

@router.get("/", response_model=List[ClientResponse])
async def list_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Listar todos los clientes activos para el menú"""
    return db.query(Client).filter(Client.is_active == True).all()

@router.post("/", response_model=ClientResponse)
async def create_client(
    client: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Registrar un nuevo cliente o punto de entrega"""
    # Validamos que no metan precios negativos
    if client.special_price is not None and client.special_price < 0:
        raise HTTPException(status_code=400, detail="El precio no puede ser negativo")

    new_client = Client(
        name=client.name,
        address=client.address,
        special_price=client.special_price
    )
    db.add(new_client)
    db.commit()
    db.refresh(new_client)
    return new_client

@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: int,
    client_update: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Actualizar precio o datos de un cliente"""
    client = db.query(Client).filter(Client.id == client_id).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    client.name = client_update.name
    client.address = client_update.address
    client.special_price = client_update.special_price
    
    db.commit()
    db.refresh(client)
    return client