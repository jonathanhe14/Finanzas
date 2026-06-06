import { TrendingDown, TrendingUp, ArrowLeftRight, ArrowRight, Receipt } from "lucide-react";
import { formatMoney } from "../../../lib/utils/money";

const TIPO_CONFIG = {
  gasto: {
    color: "text-danger",
    bg: "bg-danger/10",
    chip: "bg-danger/10 text-danger border-danger/30",
    Icon: TrendingDown,
    prefix: "−",
  },
  ingreso: {
    color: "text-success",
    bg: "bg-success/10",
    chip: "bg-success/10 text-success border-success/30",
    Icon: TrendingUp,
    prefix: "+",
  },
  transferencia: {
    color: "text-info",
    bg: "bg-info/10",
    chip: "bg-info/10 text-info border-info/30",
    Icon: ArrowLeftRight,
    prefix: "",
  },
};

export function CardUltimosMovimientos({ movimientos = [] }) {
  return (
    <div className="card-glow-border bg-surface rounded-2xl shadow-card animate-fade-up flex flex-col overflow-hidden h-full">
      <div className="px-5 py-4 border-b border-default flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse-dot" />
          <span className="text-h3 text-primary">Últimos movimientos</span>
        </div>
        <a className="text-caption text-muted hover:text-accent font-medium cursor-pointer transition-colors duration-base">
          Ver todos →
        </a>
      </div>

      {movimientos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-elevated flex items-center justify-center mb-3 ring-1 ring-inset ring-white/5">
            <Receipt className="w-5 h-5 text-muted" strokeWidth={1.75} />
          </div>
          <p className="text-sm text-primary font-medium">Aún no hay movimientos</p>
          <p className="text-caption text-muted mt-1">
            Registra tu primer ingreso o gasto del mes
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto thin-scroll divide-y divide-white/[0.05]">
          {movimientos.map((mov, i) => {
            const config = TIPO_CONFIG[mov.tipo] ?? TIPO_CONFIG.gasto;
            const { Icon, color, bg, chip, prefix } = config;

            return (
              <div
                key={mov.id ?? i}
                className="flex items-center gap-3 px-5 py-3 hover:bg-elevated transition-colors duration-base"
              >
                <div
                  className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 ring-1 ring-inset ring-white/5`}
                >
                  <Icon size={16} className={color} strokeWidth={2} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-body font-medium truncate text-primary">
                    {mov.merchant_name ?? mov.description ?? "Movimiento"}
                  </div>
                  {mov.origen_name && mov.destino_name && (
                    <div className="flex items-center gap-1 text-caption text-muted mt-0.5 min-w-0">
                      <span className="truncate">{mov.origen_name}</span>
                      <ArrowRight
                        className="w-3 h-3 flex-shrink-0 opacity-50"
                        strokeWidth={2.25}
                      />
                      <span className="truncate">{mov.destino_name}</span>
                    </div>
                  )}
                  <div className="text-caption text-faint mt-0.5">{mov.entry_date}</div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`amount text-num-sm ${color}`}>
                    {prefix}
                    {formatMoney(mov.amount, mov.currency_code ?? "CRC")}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider border ${chip}`}
                  >
                    {mov.tipo}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
