import { Pencil, Trash2, Check, CalendarClock, Link2Off } from "lucide-react";
import { formatMoney } from "../../../lib/utils/money";
import { daysUntil } from "../../../lib/utils/dates";

function monthsUntil(dueDate) {
  const today = new Date();
  const due = new Date(`${String(dueDate).slice(0, 10)}T00:00:00`);
  const m = (due.getFullYear() - today.getFullYear()) * 12 + (due.getMonth() - today.getMonth());
  return Math.max(1, m);
}

function formatFecha(dateStr) {
  const d = new Date(`${String(dateStr).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" });
}

export function GoalCard({ goal, saved, onEdit, onComplete, onDelete, busy }) {
  const currency = goal.currency_code ?? "CRC";
  const target = Number(goal.target_amount) || 0;
  const linked = goal.linked_account_id != null;
  const savedAmount = linked ? Number(saved ?? 0) : 0;

  const ratio = target > 0 ? savedAmount / target : 0;
  const pct = Math.round(ratio * 100);
  const pctBar = Math.min(Math.max(pct, 0), 100);
  const complete = ratio >= 1;

  const remaining = Math.max(target - savedAmount, 0);
  const months = monthsUntil(goal.due_date);
  const perMonth = remaining / months;
  const dleft = daysUntil(goal.due_date);

  const fillClass = complete ? "bg-success text-success" : "bg-accent text-accent";
  const chipClass = complete
    ? "bg-success/10 text-success border-success/30"
    : "bg-accent/10 text-accent border-accent/30";

  let plazo;
  if (dleft < 0) plazo = `Venció hace ${Math.abs(dleft)} d`;
  else if (dleft === 0) plazo = "Vence hoy";
  else plazo = `Faltan ${dleft} d`;

  return (
    <div className="group bg-surface border border-default rounded-2xl p-5 shadow-card space-y-3 hover:bg-elevated hover:shadow-card-hover transition-all duration-base">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-body font-semibold text-primary truncate">{goal.name}</span>
            <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 ${chipClass}`}>
              {complete ? "¡Lograda!" : `${pct}%`}
            </span>
          </div>
          {goal.description && (
            <p className="text-caption text-muted mt-0.5 truncate">{goal.description}</p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-base">
          {complete && (
            <button
              type="button"
              onClick={onComplete}
              disabled={busy}
              className="w-8 h-8 rounded-md flex items-center justify-center text-muted hover:bg-success/10 hover:text-success transition-colors duration-base disabled:opacity-50"
              title="Marcar como completada"
              aria-label="Completar meta"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            disabled={busy}
            className="w-8 h-8 rounded-md flex items-center justify-center text-muted hover:bg-surface hover:text-primary transition-colors duration-base disabled:opacity-50"
            aria-label="Editar meta"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="w-8 h-8 rounded-md flex items-center justify-center text-muted hover:bg-danger/10 hover:text-danger transition-colors duration-base disabled:opacity-50"
            aria-label="Eliminar meta"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="pbar">
        <div className={`pfill ${fillClass}`} style={{ width: `${pctBar}%` }} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="amount text-caption text-muted">
          {linked ? formatMoney(savedAmount, currency) : "—"}{" "}
          <span className="text-faint">/ {formatMoney(target, currency)}</span>
        </span>
        <span className="flex items-center gap-1.5 text-caption text-muted">
          <CalendarClock className="w-3 h-3" strokeWidth={2} />
          <span className="capitalize">{formatFecha(goal.due_date)}</span>
          <span className={`before:content-['·'] before:mx-1 ${dleft < 0 ? "text-danger" : ""}`}>{plazo}</span>
        </span>
      </div>

      {!linked ? (
        <div className="flex items-center gap-1.5 text-[11px] text-muted bg-elevated border border-dashed border-default rounded-md px-2.5 py-1.5">
          <Link2Off className="w-3 h-3" strokeWidth={2} />
          Sin cuenta vinculada — edita la meta para seguir el progreso automáticamente.
        </div>
      ) : !complete ? (
        <p className="text-[11px] text-muted">
          Ahorra <span className="amount text-secondary">{formatMoney(perMonth, currency)}</span>/mes
          para llegar a tiempo ({months} {months === 1 ? "mes" : "meses"}).
        </p>
      ) : (
        <p className="text-[11px] text-success">Alcanzaste tu objetivo 🎉</p>
      )}
    </div>
  );
}
