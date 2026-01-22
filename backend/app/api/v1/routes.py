from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.route_manifest import RouteManifest, AuditStatus
from app.api.v1.auth import get_current_active_user
from app.services.reconciliation_service import reconcile_route
from app.services.audit_service import log_activity
from app.config import settings

router = APIRouter()

# --- SCHEMAS ---

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

# --- ENDPOINTS ---

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

    return {
        "total": len(routes),
        "date": date_filter or date.today(),
        "routes": [
            {
                "id": r.id,
                "driver_id": r.driver_id,
                "driver_name": r.driver.full_name if r.driver else "N/A",
                "truck_id": r.truck_id,
                "truck_name": r.truck.nickname if r.truck else "N/A",
                "date": r.date.isoformat(),
                "checkout_time": r.checkout_timestamp.strftime("%H:%M") if r.checkout_timestamp else "--:--",
                "checkin_time": r.checkin_timestamp.strftime("%H:%M") if r.checkin_timestamp else "--:--",
                "status": r.audit_status.value,
                "initial_full_bottles": r.initial_full_bottles,
                "debt_amount": r.debt_amount
            }
            for r in routes
        ]
    }


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

    # Registro de Auditoría
    log_activity(
        db=db,
        user_id=current_user.id,
        action="ROUTE_CHECKOUT",
        entity_type="RouteManifest",
        entity_id=new_route.id,
        details=f"Salida: Chofer {data.driver_id}, Carga {data.initial_full_bottles}",
        new_value=data.dict(),
        request=request
    )

    return {
        "message": "Ruta iniciada correctamente",
        "route_id": new_route.id,
        "checkout_time": new_route.checkout_timestamp.strftime("%H:%M %p")
    }


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

    # Guardar estado anterior para auditoría
    old_data = {
        "status": route.audit_status.value,
        "debt_amount": route.debt_amount,
        "returned_full": route.returned_full_bottles
    }

    # Actualizar datos
    route.returned_full_bottles = data.returned_full_bottles
    route.returned_empty_bottles = data.returned_empty_bottles
    route.reported_damaged = data.reported_damaged
    route.evidence_verified = 1 if data.evidence_verified else 0
    route.notes = data.notes
    route.checkin_by_user_id = current_user.id
    route.checkin_timestamp = datetime.now()

    result = reconcile_route(
        route=route,
        returned_full=data.returned_full_bottles,
        returned_empty=data.returned_empty_bottles,
        reported_damaged=data.reported_damaged,
        bottle_price=settings.BOTTLE_PRICE,
        evidence_verified=data.evidence_verified
    )

    route.audit_status = result["status"]
    route.debt_amount = result["debt"]

    db.commit()
    db.refresh(route)

    # Registro de Auditoría
    log_activity(
        db=db,
        user_id=current_user.id,
        action="ROUTE_CHECKIN",
        entity_type="RouteManifest",
        entity_id=route.id,
        details=f"Entrada registrada. Deuda calculada: ${route.debt_amount}",
        old_value=old_data,
        new_value=data.dict(),
        request=request
    )

    return {
        "message": result["message"],
        "route_id": route.id,
        "checkin_time": route.checkin_timestamp.strftime("%H:%M %p"),
        "status": route.audit_status.value,
        "debt_amount": route.debt_amount
    }