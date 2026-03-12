import { TrendingDown, TrendingUp, ArrowLeftRight } from "lucide-react";

const TIPO_CONFIG = {
  gasto: {
    color: "text-rose-600",
    bg: "bg-rose-50",
    badge: "bg-rose-50 text-rose-500",
    Icon: TrendingDown,
    prefix: "-",
  },
  ingreso: {
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    badge: "bg-emerald-50 text-emerald-600",
    Icon: TrendingUp,
    prefix: "+",
  },
  transferencia: {
    color: "text-blue-600",
    bg: "bg-blue-50",
    badge: "bg-blue-50 text-blue-500",
    Icon: ArrowLeftRight,
    prefix: "",
  },
};

export function CardUltimosMovimientos({ movimientos}) {
  return (
    <div
      className="bg-white border border-border rounded-2xl shadow-card animate-fade-up d1 flex flex-col overflow-hidden"
      style={{ gridColumn: "4", gridRow: "1 / 4" }}
    >
      <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
        <span className="font-semibold text-[13px]">Últimos movimientos</span>
        <a className="text-[11px] text-emerald-600 font-medium hover:underline cursor-pointer">
          Ver todos →
        </a>
      </div>

      <div className="flex-1 overflow-y-auto thin-scroll divide-y divide-[#F0EFEC]">
        {movimientos.map((mov, i) => {
          const config = TIPO_CONFIG[mov.tipo] ?? TIPO_CONFIG.gasto;
          const { Icon, color, bg, badge, prefix } = config;

          return (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3 hover:bg-surface/60 transition-colors"
            >
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={15} className={color} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium truncate">{mov.nombre}</div>
                <div className="text-[10px] text-muted mt-0.5">{mov.fecha}</div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className={`font-mono text-[12px] font-medium ${color}`}>
                  ${mov.monto.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${badge} font-semibold capitalize`}>
                  {mov.tipo}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
