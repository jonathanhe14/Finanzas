export default function Filters({
  categorias,
  categoriaFilter,
  setCategoriaFilter,
  fechaDesde,
  setFechaDesde,
  fechaHasta,
  setFechaHasta,
}) {
  const hasActiveFilters = categoriaFilter || fechaDesde || fechaHasta;

  function clearFilters() {
    setCategoriaFilter('');
    setFechaDesde('');
    setFechaHasta('');
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Filtros
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Categoría */}
        <div>
          <label
            htmlFor="categoria"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Categoría
          </label>
          <select
            id="categoria"
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 
                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:bg-white 
                       transition-all outline-none appearance-none cursor-pointer"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha desde */}
        <div>
          <label
            htmlFor="fechaDesde"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Desde
          </label>
          <input
            id="fechaDesde"
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 
                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:bg-white 
                       transition-all outline-none"
          />
        </div>

        {/* Fecha hasta */}
        <div>
          <label
            htmlFor="fechaHasta"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Hasta
          </label>
          <input
            id="fechaHasta"
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 
                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:bg-white 
                       transition-all outline-none"
          />
        </div>
      </div>
    </div>
  );
}
