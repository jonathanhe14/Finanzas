import { useMemo } from 'react';

export default function StatsBar({ registros,onClick }) {
  const stats = useMemo(() => {
    const total = registros.reduce((sum, r) => sum + (Number(r.monto) || 0), 0);
    const count = registros.length;
    const avg = count > 0 ? total / count : 0;

    return { total, count, avg };
  }, [registros]);

  function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  const handleCreate=()=>{
    console.log("Mi boton nuevo esta funcionando")
    onClick();
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Total registros
        </p>
        <p className="text-2xl font-bold text-gray-900 tabular-nums">
          {stats.count}
        </p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Monto total
        </p>
        <p className="text-2xl font-bold text-indigo-600 tabular-nums">
          {formatCurrency(stats.total)}
        </p>
      </div>
      {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Promedio
        </p>
        <p className="text-2xl font-bold text-gray-900 tabular-nums">
          {formatCurrency(stats.avg)}
        </p>
      </div> */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <button className="inline-flex items-center px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium
                         hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm" onClick={()=>handleCreate()}>
                          Agregar
        </button>
      </div>
    </div>
  );
}
