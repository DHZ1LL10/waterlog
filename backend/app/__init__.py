"""
Script para inicializar la base de datos con datos de prueba
Ejecutar: docker-compose exec backend python init_db.py
"""

from app.database import SessionLocal, engine, Base
from app.models import User, UserRole, Truck
from app.utils.security import get_password_hash

def init_database():
    """Crear tablas y datos iniciales"""
    
    print("🔧 Creando tablas de base de datos...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas")
    
    db = SessionLocal()
    
    try:
        # Verificar si ya hay usuarios
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"⚠️  Ya hay {existing_users} usuarios en la base de datos")
            response = input("¿Desea reinicializar? (esto borrará todo) [y/N]: ")
            if response.lower() != 'y':
                print("❌ Operación cancelada")
                return
            
            # Borrar todo
            print("🗑️  Eliminando datos existentes...")
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)
        
        print("\n👤 Creando usuarios...")
        
        # Usuario Admin
        admin = User(
            username="admin",
            email="admin@waterlog.local",
            full_name="Administrador",
            hashed_password=get_password_hash("changeme123"),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)
        print("  ✓ Admin creado (usuario: admin, password: changeme123)")
        
        # Choferes de prueba
        chofer1 = User(
            username="juan",
            email="juan@waterlog.local",
            full_name="Juan Pérez",
            hashed_password=get_password_hash("chofer123"),
            role=UserRole.CHOFER,
            is_active=True
        )
        db.add(chofer1)
        print("  ✓ Chofer: juan (password: chofer123)")
        
        chofer2 = User(
            username="pedro",
            email="pedro@waterlog.local",
            full_name="Pedro González",
            hashed_password=get_password_hash("chofer123"),
            role=UserRole.CHOFER,
            is_active=True
        )
        db.add(chofer2)
        print("  ✓ Chofer: pedro (password: chofer123)")
        
        print("\n🚚 Creando camionetas...")
        
        # Camionetas de prueba
        truck1 = Truck(
            plate="ABC-123",
            nickname="La Blanca",
            brand="Nissan",
            model="NP300",
            year=2020,
            is_active=True
        )
        db.add(truck1)
        print("  ✓ Camioneta: La Blanca (ABC-123)")
        
        truck2 = Truck(
            plate="XYZ-789",
            nickname="La Roja",
            brand="Toyota",
            model="Hilux",
            year=2019,
            is_active=True
        )
        db.add(truck2)
        print("  ✓ Camioneta: La Roja (XYZ-789)")
        
        # Guardar todo
        db.commit()
        
        print("\n✅ Base de datos inicializada correctamente!")
        print("\n📋 Credenciales de acceso:")
        print("  Admin:")
        print("    Usuario: admin")
        print("    Password: changeme123")
        print("\n  Choferes:")
        print("    Usuario: juan / Password: chofer123")
        print("    Usuario: pedro / Password: chofer123")
        print("\n🔐 IMPORTANTE: Cambia estas contraseñas en producción!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_database()