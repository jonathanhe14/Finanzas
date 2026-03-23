import { TrendingDown, TrendingUp } from "lucide-react";

export const CardFlujo = ({
  trending,
  nombre,
  saldo,
  porcentaje,
  descripcion,
}) => {
  return (
    <div className="kpi-card bg-white border border-border rounded-2xl p-5 shadow-card animate-fade-up overflow-hidden relative">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-9 h-9 rounded-xl ${trending === "up" ? "bg-green-100" : "bg-rose-50"} flex items-center justify-center`}
        >
          {trending === "up" ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-rose-600" />
          )}
        </div>
        <svg width="56" height="24" viewBox="0 0 56 24">
          <polyline
            points="0,20 9,16 18,14 28,18 38,10 47,13 56,6"
            fill="none"
            stroke="#fecdd3"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="0,20 9,16 18,14 28,18 38,10 47,13 56,6"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-1">
        {nombre}
      </div>
      <div className="num font-mono text-[22px] font-medium tracking-tight leading-none mb-3">
        ${saldo.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full${
            trending === "up"
              ? "bg-green-100 text-green-600"
              : "bg-rose-50 text-rose-600"
          }`}
        >
          {porcentaje > 0
            ? `+${porcentaje.toFixed(2)}%`
            : `${porcentaje.toFixed(2)}%`}
        </span>
        <span className="text-[11px] text-muted">{descripcion}</span>
      </div>
    </div>
  );
};
