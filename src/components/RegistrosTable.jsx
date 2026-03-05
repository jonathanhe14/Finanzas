export default function RegistrosTable({ registros,onEdit,onDelete }) {
  function formatCurrency(amount) {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  function formatDate(dateString) {
    return new Intl.DateTimeFormat("es-CR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  }
  const handleClickEdit=(registro)=>{
    onEdit(registro)
  }
  const handleClickDelete=(id)=>{
    onDelete(id)
  }
  function getCategoryColor(categoria) {
    const colors = {
      Alimentación: "bg-emerald-100 text-emerald-700",
      Transporte: "bg-blue-100 text-blue-700",
      Entretenimiento: "bg-purple-100 text-purple-700",
      Salud: "bg-red-100 text-red-700",
      Educación: "bg-amber-100 text-amber-700",
      Servicios: "bg-cyan-100 text-cyan-700",
      Vivienda: "bg-orange-100 text-orange-700",
    };
    return colors[categoria] || "bg-gray-100 text-gray-700";
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Método
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">

              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {registros.map((registro, index) => (
              <tr
                key={registro.id || index}
                className="hover:bg-indigo-50/40 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {registro.nombre}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900 tabular-nums">
                  {formatCurrency(registro.monto)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                      registro.categoria,
                    )}`}
                  >
                    {registro.categoria}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {registro.metodo}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(registro.created_at)}
                </td>
                <td td className="px-6 py-4 text-sm text-gray-500" >
                  <button onClick={()=>handleClickEdit(registro)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm shadow-md hover:bg-slate-800 hover:shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
                    Editar
                  </button>
                  
                </td>
                <td td className="px-6 py-4 text-sm text-gray-500">
                  <button onClick={()=>handleClickDelete(registro.id)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white font-medium text-sm shadow-md hover:bg-red-400 hover:shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
                  Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-gray-100">
        {registros.map((registro, index) => (
          <div key={registro.id || index} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">
                {registro.nombre}
              </span>
              <span className="text-sm font-bold text-gray-900 tabular-nums">
                {formatCurrency(registro.monto)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                  registro.categoria,
                )}`}
              >
                {registro.categoria}
              </span>
              <span className="text-xs text-gray-500">{registro.metodo}</span>
            </div>
            <div className="text-xs text-gray-400">
              {formatDate(registro.created_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
