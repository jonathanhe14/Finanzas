// TransactionCard.jsx
const Card = ({ nombre, monto, cuenta }) => {
  const esPositivo = monto >= 0;

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
      </div>
      <div className="relative w-full max-w-sm group">
        {/* Borde con gradiente */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />

        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300">
          {/* Fila superior: Nombre + Monto */}
          <div className="flex items-center justify-between mb-4">
            {/* Avatar + Nombre */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <span className="text-white font-bold text-sm">
                  {nombre?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-base leading-tight">
                  {nombre}
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">Transferencia</p>
              </div>
            </div>

            {/* Monto */}
            <span
              className={`text-lg font-bold ${
                esPositivo ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {esPositivo ? "+" : "-"}$
              {Math.abs(monto).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Separador */}
          <div className="h-px bg-white/5 mb-4" />

          {/* Cuenta */}
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <span className="text-slate-400 text-sm">{cuenta}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
