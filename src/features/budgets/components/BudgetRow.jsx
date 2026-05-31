import { useState } from "react";
import { formatMoney } from "../../../lib/utils/money";

export function BudgetRow({ categoria, limite, gastado, currency = "CRC", onSave, disabled }) {
  const [value, setValue] = useState(String(limite ?? 0));

  // Sincroniza el input si el límite cambia desde afuera (p.ej. tras refetch).
  const [prevLimite, setPrevLimite] = useState(limite);
  if (limite !== prevLimite) {
    setPrevLimite(limite);
    setValue(String(limite ?? 0));
  }

  function commit() {
    const next = Number(value) || 0;
    if (next !== Number(limite ?? 0)) onSave(next);
  }

  const ratio = limite > 0 ? gastado / limite : 0;
  const porcentajeReal = Math.round(ratio * 100);
  const porcentajeBar = Math.min(porcentajeReal, 100);
  const excedido = ratio >= 1;
  const justo = ratio >= 0.8 && !excedido;
  const sinLimite = !(limite > 0);

  const fillClass = excedido
    ? "bg-danger text-danger"
    : justo
      ? "bg-warning text-warning"
      : "bg-success text-success";

  const chipClass = excedido
    ? "bg-danger/10 text-danger border-danger/30"
    : justo
      ? "bg-warning/10 text-warning border-warning/30"
      : "bg-success/10 text-success border-success/30";

  return (
    <div className="bg-surface border border-default rounded-2xl p-5 shadow-card space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-body font-semibold text-primary truncate">{categoria}</span>
        {sinLimite ? (
          <span className="text-[10px] font-semibold border border-default px-2 py-0.5 rounded-full uppercase tracking-wider text-muted flex-shrink-0">
            Sin asignar
          </span>
        ) : (
          <span
            className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 ${chipClass}`}
          >
            {excedido ? "Excedido" : `${porcentajeReal}%`}
          </span>
        )}
      </div>

      <div className="pbar">
        <div className={`pfill ${fillClass}`} style={{ width: `${porcentajeBar}%` }} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="amount text-caption text-muted">
          {formatMoney(gastado, currency)}{" "}
          <span className="text-faint">/ {formatMoney(limite, currency)}</span>
        </span>

        <div className="flex items-center gap-1.5 bg-sunken border border-default rounded-md px-2 py-1 focus-within:border-accent focus-within:shadow-focus transition-all duration-base">
          <span className="text-caption text-faint">Límite</span>
          <input
            type="number"
            min="0"
            step="any"
            value={value}
            disabled={disabled}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            className="amount bg-transparent border-0 outline-none w-24 text-right text-[12px] text-primary disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
