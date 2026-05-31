import { Pencil, Pause, Check } from "lucide-react";
import { formatMoney } from "../../../lib/utils/money";
import { daysUntil } from "../../../lib/utils/dates";

const TYPE_LABEL = {
  SUBSCRIPTION: "Suscripción",
  LOAN: "Préstamo",
  INSTALLMENT: "Cuotas",
};

function dueBadge(dateStr) {
  const d = daysUntil(dateStr);
  if (d < 0) return { text: `Vencido hace ${Math.abs(d)}d`, cls: "bg-danger/10 text-danger border-danger/30" };
  if (d === 0) return { text: "Hoy", cls: "bg-warning/10 text-warning border-warning/30" };
  if (d <= 7) return { text: `En ${d} día${d === 1 ? "" : "s"}`, cls: "bg-warning/10 text-warning border-warning/30" };
  return { text: `En ${d} días`, cls: "bg-elevated text-muted border-default" };
}

function formatDate(dateStr) {
  const [y, m, d] = String(dateStr).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-CR", { day: "numeric", month: "short" });
}

export function FixedExpenseCard({ entry, onPay, onEdit, onPause, paying, disabled }) {
  const currency = entry.currency_code ?? "CRC";
  const cuota = Number(entry.installment_amount) || 0;
  const total = entry.total_installments != null ? Number(entry.total_installments) : null;
  const done = Number(entry.completed_installments) || 0;
  const indefinido = total == null;

  const restantesCuotas = indefinido ? null : Math.max(total - done, 0);
  const faltaPagar = indefinido ? null : restantesCuotas * cuota;
  const ratio = !indefinido && total > 0 ? done / total : 0;
  const pct = Math.min(Math.round(ratio * 100), 100);

  const badge = dueBadge(entry.next_run_date);

  return (
    <div className="bg-surface border border-default rounded-2xl p-5 shadow-card space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-body font-semibold text-primary truncate">{entry.name}</span>
            <span className="text-[10px] font-semibold border border-default px-2 py-0.5 rounded-full uppercase tracking-wider text-muted flex-shrink-0">
              {TYPE_LABEL[entry.type] ?? entry.type}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${badge.cls}`}>
              {badge.text}
            </span>
            <span className="text-caption text-muted">{formatDate(entry.next_run_date)}</span>
          </div>
        </div>
        <span className="amount text-num-md text-primary flex-shrink-0">{formatMoney(cuota, currency)}</span>
      </div>

      {!indefinido ? (
        <>
          <div className="pbar">
            <div className="pfill bg-accent text-accent" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex items-center justify-between gap-3 text-caption">
            <span className="text-muted">
              Cuota {Math.min(done + (restantesCuotas > 0 ? 1 : 0), total)} de {total}
              <span className="text-faint"> · {done} pagadas</span>
            </span>
            <span className="amount text-muted">
              Falta <span className="text-primary font-semibold">{formatMoney(faltaPagar, currency)}</span>
            </span>
          </div>
        </>
      ) : (
        <p className="text-caption text-muted">Recurrente · sin fecha de finalización</p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onPay}
          disabled={paying || disabled}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-white rounded-md px-3 py-1.5 bg-brand-gradient hover:shadow-glow active:scale-[0.97] transition-all duration-base disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
          {paying ? "Registrando…" : "Pagar"}
        </button>
        <button
          type="button"
          onClick={onEdit}
          disabled={disabled}
          className="w-8 h-8 rounded-md flex items-center justify-center text-muted hover:bg-elevated hover:text-primary transition-colors duration-base disabled:opacity-50"
          aria-label="Editar"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onPause}
          disabled={disabled}
          className="w-8 h-8 rounded-md flex items-center justify-center text-muted hover:bg-elevated hover:text-danger transition-colors duration-base disabled:opacity-50"
          aria-label="Pausar"
        >
          <Pause className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
