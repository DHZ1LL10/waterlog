import StatusBadge from "../common/StatusBadge";

export default function RouteTable({ routes }) {
  return (
    <div className="bg-white rounded shadow">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Chofer</th>
            <th className="p-2 text-left">Camión</th>
            <th className="p-2 text-left">Estado</th>
            <th className="p-2 text-right">Deuda</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route) => (
            <tr key={route.id} className="border-t">
              <td className="p-2">{route.id}</td>
              <td className="p-2">{route.driver_name}</td>
              <td className="p-2">{route.truck_name}</td>
              <td className="p-2">
                <StatusBadge status={route.status} />
              </td>
              <td className="p-2 text-right font-semibold">
                ${route.debt_amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
