from sqlalchemy.orm import Session
from fastapi import Request
from typing import Dict, Any, Optional
from app.models.audit_log import AuditLog

def log_activity(
    db: Session,
    user_id: int,
    action: str,
    entity_type: str,
    entity_id: int,
    details: str = None,
    old_value: Optional[Dict[str, Any]] = None,
    new_value: Optional[Dict[str, Any]] = None,
    request: Request = None
):
    """
    Registra una acción en la bitácora de auditoría.
    Captura automáticamente la IP y el User-Agent si se proporciona el objeto request.
    """
    ip_address = None
    user_agent = None
    
    if request:
        ip_address = request.client.host
        user_agent = request.headers.get("user-agent")

    new_log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
        old_value=old_value,
        new_value=new_value,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    db.add(new_log)
    db.commit()