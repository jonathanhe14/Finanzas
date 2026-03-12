export function CardGastosCategoria({ categorias }) {
  const total = Object.values(categorias).reduce(
    (sum, monto) => sum + monto,
    0,
  );

  const COLORES = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-orange-500",
    "bg-pink-500",
  ];

  return (
    <div
      className="bg-white border border-border rounded-2xl p-5 shadow-card animate-fade-up d4"
      style={{ gridColumn: "1", gridRow: "2" }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-[13px]">Gasto por categoría</span>
        <a className="text-[11px] text-emerald-600 font-medium hover:underline cursor-pointer">
          Detalle →
        </a>
      </div>

      <div className="space-y-3.5">
        {Object.entries(categorias).map(([nombre, monto], i) => {
          const porcentaje = Math.round((monto / total) * 100);
          const color = COLORES[i % COLORES.length];

          return (
            <div key={nombre}>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${color} flex-shrink-0`}
                  ></div>
                  <span className="text-[12px] text-muted">{nombre}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted font-mono">
                    ${monto.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-mono font-semibold w-8 text-right">
                    {porcentaje}%
                  </span>
                </div>
              </div>
              <div className="pbar">
                <div
                  className={`pfill ${color}`}
                  style={{ width: `${porcentaje}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="mt-5 w-full text-[12px] font-medium text-muted bg-faint hover:bg-ink hover:text-white border border-border hover:border-ink rounded-xl py-2.5 transition-all">
        Ver movimientos filtrados
      </button>
    </div>
  );
}
