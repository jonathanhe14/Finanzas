import { Link } from "react-router-dom";
import { CalendarClock } from "lucide-react";
import { formatMoney } from "../../../lib/utils/money";
import { dueBadge, formatShortDate } from "../../../lib/utils/dates";

export function CardProximoPago({ pagos = [] }) {
  return (
    <div className="bg-surface border border-default rounded-2xl p-5 shadow-card animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <span className="text-h3 text-primary">Próximos pagos</span>
        <Link
          to="/presupuesto"
          className="text-caption text-muted hover:text-accent font-medium cursor-pointer transition-colors duration-base"
        >
          Ver todos →
        </Link>
      </div>

      {pagos.length === 0 ? (
        <div className="bg-elevated border border-dashed border-default rounded-xl px-4 py-8 text-center">
          <p className="text-sm text-primary font-medium">Sin pagos programados</p>
          <p className="text-caption text-muted mt-1">
            Crea gastos fijos para verlos aquí
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {pagos.map((entry) => {
            const badge = dueBadge(entry.next_run_date);
            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 bg-elevated border border-default rounded-xl px-3 py-2.5"
              >
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 ring-1 ring-inset ring-white/5">
                  <CalendarClock className="w-4 h-4 text-accent" strokeWidth={2} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-primary truncate">
                    {entry.name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-[10px] font-semibold border px-1.5 py-0.5 rounded-full ${badge.cls}`}
                    >
                      {badge.text}
                    </span>
                    <span className="text-caption text-muted">
                      {formatShortDate(entry.next_run_date)}
                    </span>
                  </div>
                </div>

                <span className="amount text-num-sm text-primary flex-shrink-0">
                  {formatMoney(entry.installment_amount, entry.currency_code ?? "CRC")}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
