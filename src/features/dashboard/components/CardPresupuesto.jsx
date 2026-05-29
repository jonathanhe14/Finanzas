import { formatMoney } from "../../../lib/utils/money";

export function CardPresupuesto({ presupuestos = [], currency = "CRC" }) {
  return (
    <div className="bg-surface border border-default rounded-2xl p-5 shadow-card animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <span className="text-h3 text-primary">Progreso de presupuestos</span>
        <a className="text-caption text-muted hover:text-accent font-medium cursor-pointer transition-colors duration-base">
          Ver todos →
        </a>
      </div>

      {presupuestos.length === 0 ? (
        <div className="bg-elevated border border-dashed border-default rounded-xl px-4 py-8 text-center">
          <p className="text-sm text-primary font-medium">Sin presupuestos definidos</p>
          <p className="text-caption text-muted mt-1">
            Crea presupuestos para controlar tus categorías
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {presupuestos.map(({ categoria, gastado, presupuestado }) => {
            const ratio = presupuestado > 0 ? gastado / presupuestado : 0;
            const porcentajeReal = Math.round(ratio * 100);
            const porcentajeBar = Math.min(porcentajeReal, 100);
            const excedido = ratio >= 1;
            const justo = ratio >= 0.8 && !excedido;

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
              <div key={categoria} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-primary truncate">{categoria}</span>
                  <span
                    className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 ${chipClass}`}
                  >
                    {excedido ? "Excedido" : `${porcentajeReal}%`}
                  </span>
                </div>

                <div className="pbar">
                  <div className={`pfill ${fillClass}`} style={{ width: `${porcentajeBar}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="amount text-caption text-muted">
                    {formatMoney(gastado, currency)}{" "}
                    <span className="text-faint">
                      / {formatMoney(presupuestado, currency)}
                    </span>
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
