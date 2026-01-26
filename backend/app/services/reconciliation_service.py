from app.models.route_manifest import AuditStatus

def reconcile_route(
    route, 
    returned_full: int, 
    returned_empty: int, 
    reported_damaged: int, 
    calculated_sales_total: float, # Dinero total calculado desde la lista de ventas
    total_units_sold_reported: int # Suma de garrafones en la lista de ventas
):
    """
    Lógica de conciliación: Inventario Físico vs Ventas Reportadas.
    """
    
    # 1. Calcular Inventario Físico (Lo que DEBIÓ venderse según lo que falta en la camioneta)
    initial_load = route.initial_full_bottles
    physical_sold = initial_load - returned_full - reported_damaged

    # 2. Comparar Físico vs Reportado
    # delta > 0: Faltan garrafones (Robo o error)
    # delta < 0: Sobran garrafones (Error de carga o conteo)
    delta_inventory = physical_sold - total_units_sold_reported

    # 3. Determinar Estado y Deuda
    status = AuditStatus.CLOSED
    debt = calculated_sales_total
    message = "Conciliación exitosa."

    if delta_inventory != 0:
        status = AuditStatus.LOCKED_DEBT # Se bloquea porque no cuadran los envases
        message = f"DESCUADRE DE INVENTARIO: Diferencia de {delta_inventory} garrafones entre físico y lista de ventas."
    elif reported_damaged > 0:
        message = f"Conciliado con {reported_damaged} mermas reportadas."

    return {
        "status": status,
        "debt": debt,
        "inventory_diff": delta_inventory,
        "message": message
    }