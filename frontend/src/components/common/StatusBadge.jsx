export default function StatusBadge({ status }) {
  const colors = {
    CLOSED: "bg-green-500",
    IN_PROGRESS: "bg-yellow-500",
    LOCKED_DEBT: "bg-red-600",
  };

  return (
    <span
      className={`px-2 py-1 text-white text-xs rounded ${colors[status] || "bg-gray-400"}`}
    >
      {status}
    </span>
  );
}
