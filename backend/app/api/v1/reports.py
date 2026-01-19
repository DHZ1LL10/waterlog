from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, extract, Integer  # <--- 1. Agregamos Integer
from typing import List, Optional
from datetime import date, datetime, timedelta

from app.database import get_db
from app.models.user import User
from app.models.route_manifest import RouteManifest, AuditStatus
from app.models.debt_record import DebtRecord
from app.models.truck import Truck
from app.api.v1.auth import get_current_active_user

router = APIRouter()


@router.get("/kpis")
async def get_kpis(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """KPIs principales del sistema"""
    # Fechas por defecto: últimos 30 días
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    # Total de rutas
    total_routes = db.query(RouteManifest).filter(
        RouteManifest.date >= start_date,
        RouteManifest.date <= end_date
    ).count()
    
    # Rutas con problemas (DEBT)
    problematic_routes = db.query(RouteManifest).filter(
        RouteManifest.date >= start_date,
        RouteManifest.date <= end_date,
        RouteManifest.audit_status == AuditStatus.DEBT
    ).count()
    
    # Total de garrafones procesados
    total_bottles = db.query(
        func.sum(RouteManifest.initial_full_bottles + RouteManifest.initial_empty_bottles)
    ).filter(
        RouteManifest.date >= start_date,
        RouteManifest.date <= end_date
    ).scalar() or 0
    
    # Total de deuda acumulada
    total_debt = db.query(func.sum(RouteManifest.debt_amount)).filter(
        RouteManifest.date >= start_date,
        RouteManifest.date <= end_date,
        RouteManifest.debt_amount > 0
    ).scalar() or 0
    
    # Tasa de éxito (rutas sin problemas)
    success_rate = ((total_routes - problematic_routes) / total_routes * 100) if total_routes > 0 else 100
    
    # Rutas de hoy
    today_routes = db.query(RouteManifest).filter(
        RouteManifest.date == date.today()
    ).count()
    
    # Rutas activas (en progreso)
    active_routes = db.query(RouteManifest).filter(
        RouteManifest.audit_status == AuditStatus.IN_PROGRESS
    ).count()
    
    return {
        "total_routes": total_routes,
        "problematic_routes": problematic_routes,
        "total_bottles": int(total_bottles),
        "total_debt": float(total_debt),
        "success_rate": round(success_rate, 2),
        "today_routes": today_routes,
        "active_routes": active_routes,
        "period": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        }
    }


@router.get("/trends/daily")
async def get_daily_trends(
    days: int = Query(30, le=365, ge=7),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Tendencias diarias de rutas y problemas"""
    start_date = date.today() - timedelta(days=days)
    
    # Rutas por día
    routes_by_day = db.query(
        RouteManifest.date,
        func.count(RouteManifest.id).label('total'),
        # 2. CORRECCIÓN CRÍTICA: Usamos Integer explícitamente
        func.sum(func.cast(RouteManifest.audit_status == AuditStatus.DEBT, Integer)).label('with_debt'),
        func.sum(RouteManifest.debt_amount).label('debt_amount')
    ).filter(
        RouteManifest.date >= start_date
    ).group_by(
        RouteManifest.date
    ).order_by(
        RouteManifest.date
    ).all()
    
    return {
        "trends": [
            {
                "date": row.date.isoformat(),
                "total_routes": row.total,
                "routes_with_debt": row.with_debt or 0,
                "debt_amount": float(row.debt_amount or 0)
            }
            for row in routes_by_day
        ]
    }


@router.get("/trucks/performance")
async def get_truck_performance(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Rendimiento por camioneta"""
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    truck_stats = db.query(
        Truck.id,
        Truck.nickname,
        Truck.plate,
        func.count(RouteManifest.id).label('total_routes'),
        # 3. CORRECCIÓN TAMBIÉN AQUÍ
        func.sum(func.cast(RouteManifest.audit_status == AuditStatus.DEBT, Integer)).label('problematic_routes'),
        func.sum(RouteManifest.debt_amount).label('total_debt'),
        func.sum(RouteManifest.initial_full_bottles).label('total_bottles_delivered')
    ).join(
        RouteManifest, RouteManifest.truck_id == Truck.id
    ).filter(
        RouteManifest.date >= start_date,
        RouteManifest.date <= end_date
    ).group_by(
        Truck.id, Truck.nickname, Truck.plate
    ).all()
    
    return {
        "trucks": [
            {
                "truck_id": row.id,
                "nickname": row.nickname,
                "plate": row.plate,
                "total_routes": row.total_routes,
                "problematic_routes": row.problematic_routes or 0,
                "total_debt": float(row.total_debt or 0),
                "total_bottles_delivered": row.total_bottles_delivered or 0,
                "success_rate": round(
                    ((row.total_routes - (row.problematic_routes or 0)) / row.total_routes * 100)
                    if row.total_routes > 0 else 100,
                    2
                )
            }
            for row in truck_stats
        ]
    }


@router.get("/drivers/performance")
async def get_driver_performance(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    limit: int = Query(10, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Rendimiento por chofer"""
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    driver_stats = db.query(
        User.id,
        User.full_name,
        func.count(RouteManifest.id).label('total_routes'),
        # 4. CORRECCIÓN TAMBIÉN AQUÍ
        func.sum(func.cast(RouteManifest.audit_status == AuditStatus.DEBT, Integer)).label('problematic_routes'),
        func.sum(RouteManifest.debt_amount).label('total_debt'),
        func.sum(RouteManifest.initial_full_bottles).label('total_bottles_delivered')
    ).join(
        RouteManifest, RouteManifest.driver_id == User.id
    ).filter(
        RouteManifest.date >= start_date,
        RouteManifest.date <= end_date,
        User.role == 'driver'
    ).group_by(
        User.id, User.full_name
    ).order_by(
        desc('total_routes')
    ).limit(limit).all()
    
    return {
        "drivers": [
            {
                "driver_id": row.id,
                "full_name": row.full_name,
                "total_routes": row.total_routes,
                "problematic_routes": row.problematic_routes or 0,
                "total_debt": float(row.total_debt or 0),
                "total_bottles_delivered": row.total_bottles_delivered or 0,
                "success_rate": round(
                    ((row.total_routes - (row.problematic_routes or 0)) / row.total_routes * 100)
                    if row.total_routes > 0 else 100,
                    2
                )
            }
            for row in driver_stats
        ]
    }


@router.get("/status/distribution")
async def get_status_distribution(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Distribución de estados de rutas"""
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    status_distribution = db.query(
        RouteManifest.audit_status,
        func.count(RouteManifest.id).label('count')
    ).filter(
        RouteManifest.date >= start_date,
        RouteManifest.date <= end_date
    ).group_by(
        RouteManifest.audit_status
    ).all()
    
    return {
        "distribution": [
            {
                "status": row.audit_status.value,
                "count": row.count
            }
            for row in status_distribution
        ]
    }


@router.get("/monthly/summary")
async def get_monthly_summary(
    months: int = Query(12, le=24, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Resumen mensual de operaciones"""
    start_date = date.today() - timedelta(days=months * 30)
    
    monthly_data = db.query(
        func.extract('year', RouteManifest.date).label('year'),
        func.extract('month', RouteManifest.date).label('month'),
        func.count(RouteManifest.id).label('total_routes'),
        func.sum(RouteManifest.initial_full_bottles).label('total_bottles'),
        func.sum(RouteManifest.debt_amount).label('total_debt')
    ).filter(
        RouteManifest.date >= start_date
    ).group_by(
        'year', 'month'
    ).order_by(
        'year', 'month'
    ).all()
    
    return {
        "monthly": [
            {
                "year": int(row.year),
                "month": int(row.month),
                "total_routes": row.total_routes,
                "total_bottles": row.total_bottles or 0,
                "total_debt": float(row.total_debt or 0)
            }
            for row in monthly_data
        ]
    }