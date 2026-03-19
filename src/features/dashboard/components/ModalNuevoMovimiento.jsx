import { useState, useEffect, useCallback } from "react";

// ── Static data ──────────────────────────────────────────────
const ACCOUNTS = [
  { id: "Efectivo", label: "Efectivo", emoji: "💵" },
  { id: "Wink", label: "Wink", emoji: "📱" },
  { id: "tarjeta", label: "Tarjeta", emoji: "💳" },
];

const MERCHANTS = [
  { id: "walmart", name: "Walmart", sub: "Supermercado", emoji: "🛒" },
  { id: "spotify", name: "Spotify", sub: "Entretenimiento", emoji: "🎵" },
  { id: "uber", name: "Uber", sub: "Transporte", emoji: "🚗" },
];

const CATEGORIES = [
  "Comida",
  "Transporte",
  "Servicios",
  "Personal",
  "Entretenimiento",
  "Salud",
  "Otro",
];

const CATEGORIES_INGRESO = ["Salario", "Venta", "Regalo", "Otro"];

const TYPE_META = {
  gasto: {
    color: "#f43f5e",
    bg: "#fff1f2",
    label: "Registrar gasto",
    iconColor: "text-rose-500",
  },
  ingreso: {
    color: "#16a34a",
    bg: "#f0fdf4",
    label: "Registrar ingreso",
    iconColor: "text-emerald-600",
  },
  transferencia: {
    color: "#0369a1",
    bg: "#f0f9ff",
    label: "Registrar transferencia",
    iconColor: "text-sky-600",
  },
};

// ── Sub-components ───────────────────────────────────────────
function FieldLabel({ children }) {
  return (
    <label className="block text-[11px] font-semibold text-[#9A9890] uppercase tracking-widest mb-1.5">
      {children}
    </label>
  );
}

function SelectField({ id, value, onChange, placeholder, options }) {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="w-full bg-[#F7F6F3] border border-[#E6E4DF] rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-[#111110] focus:outline-none focus:border-[#111110] focus:ring-2 focus:ring-[#111110]/8 transition-all appearance-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239A9890' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
      }}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ── Dynamic fields per type ───────────────────────────────────
function GastoFields({ form, setForm }) {
  return (
    <div className="space-y-4 animate-[fadeFields_.22s_cubic-bezier(0.16,1,0.3,1)_both]">
      {/* Cuenta de pago */}
      <div>
        <FieldLabel>Cuenta de pago</FieldLabel>
        <SelectField
          value={form.cuentaOrigen}
          onChange={(e) =>
            setForm((f) => ({ ...f, cuentaOrigen: e.target.value }))
          }
          placeholder="Selecciona una cuenta"
          options={ACCOUNTS.map((a) => ({
            value: a.id,
            label: `${a.emoji} ${a.label}`,
          }))}
        />
      </div>

      {/* Comercio o categoría */}
      <div>
        <FieldLabel>Comercio o categoría</FieldLabel>

        <p className="text-[11px] text-[#9A9890] mb-2">Comercios frecuentes</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {MERCHANTS.map((m) => {
            const selected = form.merchant === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    merchant: selected ? "" : m.id,
                    cuentaDestino: "",
                  }))
                }
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center ${
                  selected
                    ? "border-[#111110] bg-[#111110] text-white"
                    : "border-[#E6E4DF] hover:border-[#111110] hover:bg-[#F7F6F3] text-[#111110]"
                }`}
              >
                <span className="text-xl leading-none">{m.emoji}</span>
                <span className="text-[11px] font-semibold leading-tight">
                  {m.name}
                </span>
                <span
                  className={`text-[10px] ${selected ? "text-white/50" : "text-[#9A9890]"}`}
                >
                  {m.sub}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-px bg-[#E6E4DF]" />
          <span className="text-[10px] text-[#9A9890] font-medium">
            o elige categoría
          </span>
          <div className="flex-1 h-px bg-[#E6E4DF]" />
        </div>

        <SelectField
          value={form.cuentaDestino}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              cuentaDestino: e.target.value,
              merchant: "",
            }))
          }
          placeholder="Selecciona una categoría"
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
      </div>
    </div>
  );
}

function IngresoFields({ form, setForm }) {
  return (
    <div className="animate-[fadeFields_.22s_cubic-bezier(0.16,1,0.3,1)_both]">
      <FieldLabel>Cuenta de destino</FieldLabel>
      <SelectField
        value={form.cuentaDestino}
        onChange={(e) =>
          setForm((f) => ({ ...f, cuentaDestino: e.target.value }))
        }
        placeholder="Selecciona una cuenta"
        options={ACCOUNTS.map((a) => ({
          value: a.id,
          label: `${a.emoji} ${a.label}`,
        }))}
      />
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-px bg-[#E6E4DF]" />
        <span className="text-[10px] text-[#9A9890] font-medium">
         Categoria del ingreso
        </span>
        <div className="flex-1 h-px bg-[#E6E4DF]" />
      </div>

      <SelectField
        value={form.cuentaOrigen}
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            cuentaOrigen: e.target.value,
            merchant: "",
          }))
        }
        placeholder="Selecciona una categoría"
        options={CATEGORIES_INGRESO.map((c) => ({ value: c, label: c }))}
      />
    </div>
  );
}

function TransferenciaFields({ form, setForm }) {
  const destinoOptions = ACCOUNTS.filter((a) => a.id !== form.cuentaOrigen).map(
    (a) => ({ value: a.id, label: `${a.emoji} ${a.label}` }),
  );

  return (
    <div className="space-y-3 animate-[fadeFields_.22s_cubic-bezier(0.16,1,0.3,1)_both]">
      {/* Origen */}
      <div>
        <FieldLabel>Cuenta de origen</FieldLabel>
        <SelectField
          value={form.cuentaOrigen}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              cuentaOrigen: e.target.value,
              cuentaDestino: "",
            }))
          }
          placeholder="Selecciona cuenta origen"
          options={ACCOUNTS.map((a) => ({
            value: a.id,
            label: `${a.emoji} ${a.label}`,
          }))}
        />
      </div>

      {/* Arrow divider */}
      <div className="flex items-center gap-3 py-0.5">
        <div className="flex-1 h-px bg-[#E6E4DF]" />
        <div className="w-7 h-7 rounded-full bg-[#F0EFEC] border border-[#E6E4DF] flex items-center justify-center flex-shrink-0">
          <svg
            className="w-3.5 h-3.5 text-[#9A9890]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 12H5m7 7l7-7-7-7"
            />
          </svg>
        </div>
        <div className="flex-1 h-px bg-[#E6E4DF]" />
      </div>

      {/* Destino */}
      <div>
        <FieldLabel>Cuenta de destino</FieldLabel>
        <SelectField
          value={form.cuentaDestino}
          onChange={(e) =>
            setForm((f) => ({ ...f, cuentaDestino: e.target.value }))
          }
          placeholder="Selecciona cuenta destino"
          options={destinoOptions}
        />
      </div>
    </div>
  );
}

// ── Default form state ────────────────────────────────────────
const defaultForm = {
  nombre: "",
  monto: "",
  tipo: "gasto",
  // gasto
  merchant: "",
  categoria: "",
  // ingreso
  cuentaDestino: "",
  // transferencia
  cuentaOrigen: "",
};

// ── Main component ────────────────────────────────────────────
export default function ModalNuevoMovimiento({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState(defaultForm);
  const [visible, setVisible] = useState(false);

  // Animate in/out
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      const t = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Reset on open
  useEffect(() => {
    if (isOpen) setForm(defaultForm);
  }, [isOpen]);

  // Escape key
  const handleKey = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, handleKey]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!visible) return null;

  const meta = TYPE_META[form.tipo];

  function handleSave() {
    // Basic validation
    if (!form.nombre.trim() || !form.monto) return;
    onSave({ ...form, monto: parseFloat(form.monto) });
    onClose();
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0"}`}
    >
      {/* Overlay */}
      <div
        className="fixed z-[100] inset-0 bg-[#111110]/60 backdrop-blur-[3px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative z-[101] bg-white rounded-2xl w-full max-w-[440px] mx-4 my-auto max-h-[90vh] flex flex-col transition-all duration-[280ms] ${
          isOpen
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-[0.98]"
        }`}
        style={{
          boxShadow:
            "0 24px 64px -12px rgba(0,0,0,0.18), 0 8px 24px -8px rgba(0,0,0,0.10)",
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-[#E6E4DF]">
          <div>
            <h2 className="font-semibold text-[15px] tracking-tight">
              Nuevo movimiento
            </h2>
            <p className="text-[11px] text-[#9A9890] mt-0.5">
              Registra un ingreso, gasto o transferencia
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#F0EFEC] hover:bg-[#E6E4DF] flex items-center justify-center transition-colors flex-shrink-0"
          >
            <svg
              className="w-3.5 h-3.5 text-[#9A9890]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div
          className="px-6 py-5 space-y-5 overflow-y-auto max-h-[70vh]"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#D5D3CE transparent",
          }}
        >
          {/* Type selector */}
          <div>
            <FieldLabel>Tipo</FieldLabel>
            <div className="grid grid-cols-3 gap-1.5 bg-[#F0EFEC] p-1 rounded-xl">
              {["gasto", "ingreso", "transferencia"].map((t) => {
                const m = TYPE_META[t];
                const active = form.tipo === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...defaultForm, tipo: t }))
                    }
                    className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-[10px] transition-all"
                    style={
                      active
                        ? {
                            background: m.bg,
                            color: m.color,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                          }
                        : { color: "#9A9890" }
                    }
                  >
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center">
                      {t === "gasto" && (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      )}
                      {t === "ingreso" && (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      )}
                      {t === "transferencia" && (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold capitalize">
                      {t}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nombre */}
          <div>
            <FieldLabel>Nombre</FieldLabel>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) =>
                setForm((f) => ({ ...f, nombre: e.target.value }))
              }
              placeholder="Ej. Supermercado, Salario…"
              className="w-full bg-[#F7F6F3] border border-[#E6E4DF] rounded-xl px-3.5 py-2.5 text-[13px] font-medium placeholder-[#C8C6C0] focus:outline-none focus:border-[#111110] focus:ring-2 focus:ring-[#111110]/8 transition-all"
            />
          </div>

          {/* Monto */}
          <div>
            <FieldLabel>Monto</FieldLabel>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[15px] font-medium text-[#C8C6C0] pointer-events-none">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.monto}
                onChange={(e) =>
                  setForm((f) => ({ ...f, monto: e.target.value }))
                }
                placeholder="0.00"
                className="w-full bg-[#F7F6F3] border border-[#E6E4DF] rounded-xl pl-8 pr-3.5 py-2.5 font-mono text-[15px] font-medium tracking-tight placeholder-[#C8C6C0] focus:outline-none focus:border-[#111110] focus:ring-2 focus:ring-[#111110]/8 transition-all"
              />
            </div>
          </div>

          {/* Dynamic fields */}
          {form.tipo === "gasto" && (
            <GastoFields form={form} setForm={setForm} />
          )}
          {form.tipo === "ingreso" && (
            <IngresoFields form={form} setForm={setForm} />
          )}
          {form.tipo === "transferencia" && (
            <TransferenciaFields form={form} setForm={setForm} />
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-6 pt-4 flex gap-2.5 border-t border-[#E6E4DF]">
          <button
            onClick={onClose}
            className="flex-1 text-[13px] font-medium text-[#9A9890] bg-[#F0EFEC] hover:bg-[#E6E4DF] border border-[#E6E4DF] rounded-xl py-2.5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!form.nombre.trim() || !form.monto}
            className="flex-1 text-[13px] font-medium text-white rounded-xl py-2.5 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: meta.color }}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            {meta.label}
          </button>
        </div>
      </div>
    </div>
  );
}
