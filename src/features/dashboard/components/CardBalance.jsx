import { CreditCard, Scale } from "lucide-react";

export function CardBalance({ nombre, saldo, tipo, detalles }) {
  return (
    <div className="kpi-card bg-white border border-border rounded-2xl p-5 shadow-card animate-fade-up d2 overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl ${tipo === "ASSET" ? "bg-green-100": "bg-amber-100"} flex items-center justify-center`}>
            {tipo === "ASSET" ? <Scale class="w-4 h-4 text-green-600" /> : <CreditCard class="w-4 h-4 text-amber-600" />}
        </div>
        <span className={`text-[9px] font-semibold ${tipo ==="ASSET"? "text-green-600 bg-green-100":"text-ambre-600 bg-amber-100"} px-2 py-0.5 rounded-full uppercase tracking-wider`}>
          {tipo}
        </span>
      </div>
      <div className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-1">
        {nombre}
      </div>
      <div className="num font-mono text-[22px] font-medium tracking-tight leading-none mb-3">
        ${saldo.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}
      </div>
      <div className="text-[11px] text-muted">{detalles}</div>
    </div>
  );
}
