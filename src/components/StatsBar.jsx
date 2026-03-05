import { useMemo } from 'react';

export default function StatsBar({ registros }) {
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
    </div>
  );
}
