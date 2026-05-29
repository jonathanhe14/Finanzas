import { CreditCard, Wallet } from "lucide-react";
import { formatMoney } from "../../../lib/utils/money";

const META = {
  ASSET: {
    label: "Activo",
    Icon: Wallet,
    iconBg: "bg-success/10",
    iconColor: "text-success",
    chip: "bg-success/10 text-success border-success/30",
    rings: ["bg-success/40", "bg-success/20"],
  },
  LIABILITY: {
    label: "Pasivo",
    Icon: CreditCard,
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    chip: "bg-warning/10 text-warning border-warning/30",
    rings: ["bg-warning/40", "bg-warning/20"],
  },
};

export function CardBalance({ nombre, saldo, tipo = "ASSET", detalles, currency = "CRC" }) {
  const meta = META[tipo] ?? META.ASSET;
  const Icon = meta.Icon;

  return (
    <div className="card-gradient-border rounded-2xl p-5 animate-fade-up relative overflow-hidden">
      {/* Decorative dotted dots top-right */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-60">
        <span className={`w-1 h-1 rounded-full ${meta.rings[0]}`} />
        <span className={`w-1 h-1 rounded-full ${meta.rings[1]}`} />
      </div>

      <div className="flex items-start justify-between mb-5">
        <div
          className={`w-10 h-10 rounded-xl ${meta.iconBg} flex items-center justify-center ring-1 ring-inset ring-white/5`}
        >
          <Icon className={`w-4 h-4 ${meta.iconColor}`} strokeWidth={2.25} />
        </div>
        <span
          className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full uppercase tracking-wider ${meta.chip}`}
        >
          {meta.label}
        </span>
      </div>

      <div className="text-eyebrow text-muted uppercase mb-2">{nombre}</div>

      <div className="amount text-num-lg text-primary leading-none mb-3">
        {formatMoney(saldo, currency)}
      </div>

      <div className="text-caption text-muted">{detalles}</div>
    </div>
  );
}
