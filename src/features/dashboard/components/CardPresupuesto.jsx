
export function CardPresupuesto({ presupuestos }) {
  return (
    <div
      className="bg-white border border-border rounded-2xl p-5 shadow-card animate-fade-up d5"
      style={{ gridColumn: "2/4", gridRow: "2" }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-[17px]">Progreso de presupuestos</span>
        <a className="text-[11px] text-emerald-600 font-medium hover:underline cursor-pointer">Ver todos →</a>
      </div>

      <div className="grid grid-cols-[1fr_76px_76px_110px] gap-x-3 pb-2 border-b border-faint mb-1">
        <span className="text-[15px] font-bold text-muted uppercase tracking-wider">Categoría</span>
        <span className="text-[15px] font-semibold text-muted uppercase tracking-wider text-right">Gastado</span>
        <span className="text-[15px] font-semibold text-muted uppercase tracking-wider text-right">Límite</span>
        <span className="text-[15px] font-semibold text-muted uppercase tracking-wider text-right">Estado</span>
      </div>

      <div className="divide-y divide-[#F0EFEC]">
        {presupuestos.map(({ categoria, gastado, presupuestado }) => {
          const porcentaje = Math.min(Math.round((gastado / presupuestado) * 100), 100);
          const excedido = gastado > presupuestado;
          const justo = porcentaje >= 85 && !excedido;

          const estadoConfig = excedido
            ? { label: "Excedido", className: "bg-rose-50 text-rose-500" }
            : justo
            ? { label: `${porcentaje}%`, className: "bg-amber-50 text-amber-500" }
            : { label: `${porcentaje}%`, className: "bg-emerald-50 text-emerald-600" };

          return (
            <div
              key={categoria}
              className="grid grid-cols-[1fr_76px_76px_110px] gap-x-3 py-2.5 items-center hover:bg-surface rounded-lg -mx-1 px-1 transition-colors"
            >
              <span className="text-[15px] font-semibold">{categoria}</span>

              <span className={`text-[15px] font-mono text-right ${excedido ? "text-rose-500" : "text-muted"}`}>
                ${gastado.toLocaleString()}
              </span>

              <span className="text-[15px] font-mono text-right text-muted">
                ${presupuestado.toLocaleString()}
              </span>

              <div className="flex justify-end">
                <span className={`text-[13px] font-semibold px-2 py-1 rounded-lg ${estadoConfig.className}`}>
                  {estadoConfig.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button className="mt-4 w-full text-[12px] font-medium text-muted bg-faint hover:bg-ink hover:text-white border border-border hover:border-ink rounded-xl py-2.5 transition-all">
        Ver todos los presupuestos
      </button>
    </div>
  );
}
