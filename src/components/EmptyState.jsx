export default function EmptyState({ hasFilters }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center">
          <span className="text-2xl">{hasFilters ? "🔍" : "📋"}</span>
        </div>
        <div className="text-center">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {hasFilters ? "Sin resultados" : "Sin registros"}
          </h3>
          <p className="text-sm text-gray-500 max-w-md">
            {hasFilters
              ? "No se encontraron registros con los filtros seleccionados. Intenta ajustar los criterios de búsqueda."
              : "Aún no hay registros en la base de datos. Los registros aparecerán aquí cuando se agreguen."}
          </p>
        </div>
      </div>
    </div>
  );
}
