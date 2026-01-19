export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {Icon && (
        <div className="bg-gray-100 rounded-full p-6 mb-4">
          <Icon className="w-12 h-12 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-center max-w-md mb-4">{description}</p>
      )}
      {action && action}
    </div>
  );
}
