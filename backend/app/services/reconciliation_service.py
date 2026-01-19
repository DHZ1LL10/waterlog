from app.models.route_manifest import AuditStatus


def reconcile_route(
    route,
    returned_full: int,
    returned_empty: int,
    reported_damaged: int,
    bottle_price: float,
    evidence_verified: bool
):
    expected = route.initial_full_bottles + route.initial_empty_bottles
    actual = returned_full + returned_empty + reported_damaged
    delta = expected - actual

    if delta == 0:
        return {
            "status": AuditStatus.CLOSED,
            "debt": 0.0,
            "message": "Ruta cerrada exitosamente. Inventario correcto.",
            "delta": 0
        }

    if delta > 0:
        if reported_damaged > 0 and evidence_verified:
            return {
                "status": AuditStatus.CLOSED,
                "debt": 0.0,
                "message": f"Ruta cerrada. {reported_damaged} unidades dañadas con evidencia.",
                "delta": delta
            }

        debt = delta * bottle_price
        return {
            "status": AuditStatus.LOCKED_DEBT,
            "debt": debt,
            "message": f"DESCUADRE DETECTADO. Faltan {delta} unidades. Deuda: ${debt:.2f}",
            "delta": delta
        }

    return {
        "status": AuditStatus.CLOSED,
        "debt": 0.0,
        "message": f"Ruta cerrada. Sobran {abs(delta)} unidades.",
        "delta": delta
    }
