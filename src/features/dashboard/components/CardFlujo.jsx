import { TrendingDown, TrendingUp } from "lucide-react";
import { formatMoney } from "../../../lib/utils/money";

// Mini sparkline (decorative, signals trend visually)
function Sparkline({ trending }) {
  const isUp = trending === "up";
  const path = isUp
    ? "M0,18 L12,14 L24,16 L36,10 L48,12 L60,5"
    : "M0,5 L12,9 L24,7 L36,13 L48,11 L60,18";
  const color = isUp ? "#10B981" : "#F43F5E";
  const id = `spark-${trending}`;
  return (
    <svg width="64" height="22" viewBox="0 0 60 22" className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L60,22 L0,22 Z`} fill={`url(#${id})`} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const CardFlujo = ({
  trending,
  nombre,
  saldo,
  porcentaje,
  descripcion,
  currency = "CRC",
}) => {
  const isUp = trending === "up";
  const Icon = isUp ? TrendingUp : TrendingDown;
  const semantic = isUp
    ? {
        iconBg: "bg-success/10",
        iconColor: "text-success",
      }
    : {
        iconBg: "bg-danger/10",
        iconColor: "text-danger",
      };

  const showPct =
    typeof porcentaje === "number" && !Number.isNaN(porcentaje) && porcentaje !== 0;

  // El chip de comparación refleja el CAMBIO (no la identidad de la tarjeta):
  // flecha según el signo del %, y color según si el cambio es favorable
  // (ingreso↑ o gasto↓ = verde; lo contrario = rojo).
  const subio = showPct && porcentaje > 0;
  const esBueno = isUp ? subio : !subio;
  const ChipIcon = subio ? TrendingUp : TrendingDown;
  const chipCls = !showPct
    ? "bg-elevated text-muted border-default"
    : esBueno
      ? "bg-success/10 text-success border-success/30"
      : "bg-danger/10 text-danger border-danger/30";

  return (
    <div className="card-gradient-border rounded-2xl p-5 animate-fade-up">
      <div className="flex items-start justify-between mb-5">
        <div
          className={`w-10 h-10 rounded-xl ${semantic.iconBg} flex items-center justify-center ring-1 ring-inset ring-white/5`}
        >
          <Icon className={`w-4 h-4 ${semantic.iconColor}`} strokeWidth={2.25} />
        </div>
        <Sparkline trending={trending} />
      </div>

      <div className="text-eyebrow text-muted uppercase mb-2">{nombre}</div>

      <div className="amount text-num-lg text-primary leading-none mb-3">
        {formatMoney(saldo, currency)}
      </div>

      {(showPct || descripcion) && (
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${chipCls}`}
          >
            {showPct ? (
              <>
                <ChipIcon className="w-3 h-3" strokeWidth={2.5} />
                {`${porcentaje > 0 ? "+" : ""}${porcentaje.toFixed(1)}%`}
              </>
            ) : (
              "—"
            )}
          </span>
          <span className="text-caption text-muted">{descripcion}</span>
        </div>
      )}
    </div>
  );
};
