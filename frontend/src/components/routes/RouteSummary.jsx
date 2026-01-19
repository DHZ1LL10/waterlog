export default function RouteSummary({ routes }) {
  const totalRoutes = routes.length;
  const routesWithDebt = routes.filter(
    (r) => r.status === "LOCKED_DEBT"
  );

  const totalDebt = routesWithDebt.reduce(
    (sum, r) => sum + r.debt_amount,
    0
  );

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-500">Rutas del día</p>
        <p className="text-2xl font-bold">{totalRoutes}</p>
      </div>

      <div className="bg-red-100 p-4 rounded shadow">
        <p className="text-sm text-gray-500">Rutas con deuda</p>
        <p className="text-2xl font-bold text-red-600">
          {routesWithDebt.length}
        </p>
      </div>

      <div className="bg-yellow-100 p-4 rounded shadow">
        <p className="text-sm text-gray-500">Total adeudado</p>
        <p className="text-2xl font-bold">
          ${totalDebt.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
