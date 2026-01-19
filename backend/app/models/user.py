from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from datetime import datetime
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    """Roles de usuario en el sistema"""
    ADMIN = "ADMIN"
    CHOFER = "CHOFER"
    SUPERVISOR = "SUPERVISOR"
    AUDITOR = "AUDITOR"


class User(Base):
    """Modelo de Usuario"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.CHOFER, nullable=False)
    
    # Estado
    is_active = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<User {self.username} ({self.role})>"