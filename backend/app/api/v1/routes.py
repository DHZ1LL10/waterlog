from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.route_manifest import RouteManifest, AuditStatus
from app.models.client import Client
from app.models.sales_detail import SalesDetail
from app.api.v1.auth import get_current_active_user
from app.services.reconciliation_service import reconcile_route
from app.services.audit_service import log_activity
from app.config import settings

router = APIRouter()

# --- SCHEMAS ---

class SaleItemSchema(BaseModel):
    client_id: int
    quantity: int

class CheckoutSchema(BaseModel):
    driver_id: int
    truck_id: int
    initial_full_bottles: int

class CheckinSchema(BaseModel):
    returned_full_bottles: int
    returned_empty_bottles: int
    reported_damaged: int = 0
    evidence_verified: bool = False
    notes: Optional[str] = None
    sales: List[SaleItemSchema] = [] # <--- LISTA DE VENTAS

# --- ENDPOINTS ---

# ... (El endpoint de list_routes y checkout se quedan igual que antes) ...
@router.get("/")
async def list_routes(
    date_filter: date = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(RouteManifest)
    if date_filter:
        query = query.filter(RouteManifest.date == date_filter)
    else:
        query = query.filter(RouteManifest.date == date.today())
    routes = query.all()
    
    # Simplificamos la respuesta para la lista
    return {"total": len(routes), "routes": routes}

@router.post("/checkout")
async def checkout_route(
    request: Request,
    data: CheckoutSchema, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    now = datetime.now()
    new_route = RouteManifest(
        driver_id=data.driver_id,
        truck_id=data.truck_id,
        initial_full_bottles=data.initial_full_bottles,
        initial_empty_bottles=0,
        checkout_by_user_id=current_user.id,
        audit_status=AuditStatus.IN_PROGRESS,
        date=now.date(),
        checkout_timestamp=now
    )
    db.add(new_route)
    db.commit()
    db.refresh(new_route)
    
    log_activity(db, current_user.id, "ROUTE_CHECKOUT", "RouteManifest", new_route.id, f"Salida ruta {new_route.id}", request=request)

    return {"message": "Ruta iniciada", "route_id": new_route.id}


# === EL CHECK-IN BRUTAL ===
@router.post("/{route_id}/checkin")
async def checkin_route(
    request: Request,
    route_id: int,
    data: CheckinSchema, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    route = db.query(RouteManifest).filter(RouteManifest.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")

    # 1. Procesar Ventas y Calcular Dinero
    total_sales_money = 0.0
    total_units_sold = 0
    
    # Limpiar detalles anteriores si hubiera (por si reintentan el checkin)
    db.query(SalesDetail).filter(SalesDetail.route_id == route.id).delete()

    for item in data.sales:
        # Buscar precio del cliente
        client = db.query(Client).filter(Client.id == item.client_id).first()
        if not client:
            continue # O lanzar error
            
        # Lógica de Precio: Si tiene precio especial usalo, si no, usa el global
        final_price = client.special_price if client.special_price is not None else settings.BOTTLE_PRICE
        
        subtotal = item.quantity * final_price
        
        # Guardar Detalle
        detail = SalesDetail(
            route_id=route.id,
            client_id=client.id,
            quantity=item.quantity,
            unit_price=final_price,
            subtotal=subtotal
        )
        db.add(detail)
        
        total_sales_money += subtotal
        total_units_sold += item.quantity

    # 2. Actualizar Ruta
    route.returned_full_bottles = data.returned_full_bottles
    route.returned_empty_bottles = data.returned_empty_bottles
    route.reported_damaged = data.reported_damaged
    route.evidence_verified = 1 if data.evidence_verified else 0
    route.notes = data.notes
    route.checkin_by_user_id = current_user.id
    route.checkin_timestamp = datetime.now()

    # 3. Conciliar (Usando el nuevo servicio)
    result = reconcile_route(
        route=route,
        returned_full=data.returned_full_bottles,
        returned_empty=data.returned_empty_bottles,
        reported_damaged=data.reported_damaged,
        calculated_sales_total=total_sales_money,
        total_units_sold_reported=total_units_sold
    )

    route.audit_status = result["status"]
    route.debt_amount = result["debt"]

    db.commit()
    db.refresh(route)

    # Auditoría
    log_activity(db, current_user.id, "ROUTE_CHECKIN", "RouteManifest", route.id, result["message"], request=request)

    return result