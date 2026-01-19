from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import uuid
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.truck import Truck

# Configuración de hash
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def get_password_hash(password):
    return pwd_context.hash(password)

router = APIRouter()

# --- SCHEMAS ---
class DriverCreate(BaseModel):
    full_name: str
    email: Optional[str] = None 

class TruckCreate(BaseModel):
    plate: str
    nickname: str
    brand: str
    model: str
    year: int

# --- ENDPOINTS ---

@router.get("/drivers")
def get_active_drivers(db: Session = Depends(get_db)):
    # Filtramos por el rol correcto en la DB: "CHOFER"
    return db.query(User).filter(User.role == "CHOFER", User.is_active == True).all()

@router.post("/drivers")
def create_driver(driver: DriverCreate, db: Session = Depends(get_db)):
    print(f"\n👇 PETICIÓN DE CREACIÓN RECIBIDA 👇")

    try:
        # 1. Generación de datos automáticos
        unique_id = str(uuid.uuid4())[:8]
        clean_name = driver.full_name.lower().replace(" ", "")[:10]
        
        generated_username = f"{clean_name}_{unique_id}"
        
        # Email automático si no viene uno
        final_email = driver.email if driver.email else f"{generated_username}@waterlog.local"
        
        # 2. Contraseña por defecto
        hashed_pw = get_password_hash("driver123")

        new_driver = User(
            username=generated_username,
            full_name=driver.full_name,
            email=final_email,
            hashed_password=hashed_pw,
            role="CHOFER",  # <--- ¡AQUÍ ESTABA EL ERROR! (Debe ser "CHOFER")
            is_active=True
        )
        
        db.add(new_driver)
        db.commit()
        db.refresh(new_driver)
        
        print(f" ✅ ÉXITO: Chofer creado: {new_driver.full_name}")
        return new_driver
        
    except Exception as e:
        print(f" ❌ ERROR EN BASE DE DATOS: {str(e)}")
        db.rollback()
        # Si el error es por duplicado u otra cosa, lo informamos bien
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/trucks")
def get_active_trucks(db: Session = Depends(get_db)):
    return db.query(Truck).filter(Truck.is_active == True).all()

@router.post("/trucks")
def create_truck(truck: TruckCreate, db: Session = Depends(get_db)):
    if db.query(Truck).filter(Truck.plate == truck.plate).first():
        raise HTTPException(status_code=400, detail="Esa placa ya está registrada")
    
    new_truck = Truck(
        plate=truck.plate,
        nickname=truck.nickname,
        brand=truck.brand,
        model=truck.model,
        year=truck.year,
        is_active=True
    )
    db.add(new_truck)
    db.commit()
    db.refresh(new_truck)
    return new_truck