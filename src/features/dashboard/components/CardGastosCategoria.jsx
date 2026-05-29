import { PieChart } from "lucide-react";
import { formatMoney } from "../../../lib/utils/money";

const PALETTE = [
  "bg-danger text-danger",
  "bg-warning text-warning",
  "bg-info text-info",
  "bg-success text-success",
  "bg-brand2 text-brand2",
  "bg-accent text-accent",
];

export function CardGastosCategoria({ categorias = [], currency = "CRC" }) {
  const top6 = categorias.slice(0, 6);
  const total = top6.reduce((sum, cat) => sum + Number(cat.total_expense), 0);
  const isEmpty = top6.length === 0 || total === 0;

  return (
    <div className="bg-surface border border-default rounded-2xl p-5 shadow-card animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <span className="text-h3 text-primary">Gasto por categoría</span>
        <a className="text-caption text-muted hover:text-accent font-medium cursor-pointer transition-colors duration-base">
          Detalle →
        </a>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-elevated flex items-center justify-center mb-3 ring-1 ring-inset ring-white/5">
            <PieChart className="w-5 h-5 text-muted" strokeWidth={1.75} />
          </div>
          <p className="text-sm text-primary font-medium">Sin gastos este mes</p>
          <p className="text-caption text-muted mt-1">
            Aquí verás un desglose por categoría
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {top6.map((cat, i) => {
            const monto = Number(cat.total_expense);
            const porcentaje = Math.round((monto / total) * 100);
            const [bgClass] = PALETTE[i % PALETTE.length].split(" ");

            return (
              <div key={cat.account_name ?? i}>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-2 h-2 rounded-full ${bgClass} flex-shrink-0 shadow-[0_0_8px_currentColor]`} />
                    <span className="text-sm text-secondary truncate">{cat.account_name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="amount text-caption text-muted">
                      {formatMoney(monto, currency)}
                    </span>
                    <span className="amount text-caption font-semibold w-9 text-right text-primary">
                      {porcentaje}%
                    </span>
                  </div>
                </div>
                <div className="pbar">
                  <div className={`pfill ${bgClass}`} style={{ width: `${porcentaje}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
