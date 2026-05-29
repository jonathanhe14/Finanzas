import { useState, useEffect, useCallback } from "react";
import { X, Wallet, CreditCard, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useCreateAccount, useCurrencies } from "../hooks/useAccountsList";

const TYPE_OPTIONS = {
  cuenta: [
    { value: "ASSET", label: "Activo", hint: "Efectivo, banco, ahorros", Icon: Wallet, accent: "success" },
    { value: "LIABILITY", label: "Pasivo", hint: "Tarjetas, préstamos", Icon: CreditCard, accent: "warning" },
  ],
  categoria: [
    { value: "EXPENSE", label: "Gasto", hint: "Alimentación, transporte…", Icon: ArrowDownCircle, accent: "danger" },
    { value: "INCOME", label: "Ingreso", hint: "Salario, extras…", Icon: ArrowUpCircle, accent: "info" },
  ],
};

const DEFAULT_FORM = {
  name: "",
  type: "",
  currency_code: "CRC",
  opening_balance: "",
};

export default function ModalNuevaCuenta({ isOpen, onClose, mode = "cuenta" }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(null);

  const { data: currencies = [] } = useCurrencies();
  const createMutation = useCreateAccount();

  const typeOptions = TYPE_OPTIONS[mode];
  const isCategoria = mode === "categoria";

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setForm({ ...DEFAULT_FORM, type: typeOptions[0].value });
      setError(null);
    } else {
      const t = setTimeout(() => setVisible(false), 280);
      return () => clearTimeout(t);
    }
  }, [isOpen, mode]);

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

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!visible) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.type || !form.currency_code) return;

    try {
      await createMutation.mutateAsync({
        name: form.name,
        type: form.type,
        currency_code: form.currency_code,
        opening_balance: isCategoria ? 0 : parseFloat(form.opening_balance || 0),
      });
      onClose();
    } catch (err) {
      setError(err.message || "No se pudo crear");
    }
  }

  const title = isCategoria ? "Nueva categoría" : "Nueva cuenta";
  const subtitle = isCategoria
    ? "Agrega una categoría de gasto o ingreso"
    : "Agrega una cuenta o tarjeta";

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-slow ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      <form
        onSubmit={handleSubmit}
        className={`relative z-[101] bg-surface rounded-3xl w-full max-w-[480px] mx-4 my-auto max-h-[90vh] flex flex-col transition-all duration-slow ease-standard shadow-modal ${
          isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-[0.96]"
        }`}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-default">
          <div>
            <h2 className="font-display text-h2 text-primary">{title}</h2>
            <p className="text-caption text-muted mt-1">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-elevated hover:bg-base flex items-center justify-center transition-colors duration-base flex-shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-3.5 h-3.5 text-muted" strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto thin-scroll max-h-[70vh]">
          <div>
            <label className="block text-eyebrow text-muted uppercase mb-2">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              {typeOptions.map((opt) => {
                const active = form.type === opt.value;
                const Icon = opt.Icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: opt.value }))}
                    className={`relative flex flex-col items-start gap-1.5 p-3 rounded-xl border transition-all duration-base ease-standard text-left ${
                      active
                        ? "border-accent bg-accent/10 text-primary"
                        : "border-default hover:border-strong hover:bg-elevated text-secondary"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${active ? "text-accent" : "text-muted"}`}
                      strokeWidth={2}
                    />
                    <span className="text-[13px] font-semibold leading-tight text-primary">
                      {opt.label}
                    </span>
                    <span className="text-[10px] leading-tight text-muted">{opt.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-eyebrow text-muted uppercase mb-2">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={isCategoria ? "Ej. Alimentación, Salario…" : "Ej. Efectivo, BAC…"}
              autoFocus
              className="w-full bg-sunken border border-default rounded-md px-3.5 py-2.5 text-body font-medium text-primary placeholder:text-faint focus:outline-none focus:border-accent focus:shadow-focus transition-all duration-base"
            />
          </div>

          {!isCategoria && (
            <>
              <div>
                <label className="block text-eyebrow text-muted uppercase mb-2">Moneda</label>
                <select
                  value={form.currency_code}
                  onChange={(e) => setForm((f) => ({ ...f, currency_code: e.target.value }))}
                  className="w-full bg-sunken border border-default rounded-md px-3.5 py-2.5 text-body font-medium text-primary focus:outline-none focus:border-accent focus:shadow-focus transition-all duration-base appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                  }}
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code} className="bg-surface">
                      {c.symbol} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-eyebrow text-muted uppercase mb-2">
                  Saldo inicial (opcional)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 amount text-num-md text-faint pointer-events-none">
                    ₡
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.opening_balance}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, opening_balance: e.target.value }))
                    }
                    placeholder="0.00"
                    className="w-full bg-sunken border border-default rounded-md pl-9 pr-3.5 py-2.5 amount text-num-md tracking-tight text-primary placeholder:text-faint focus:outline-none focus:border-accent focus:shadow-focus transition-all duration-base"
                  />
                </div>
              </div>
            </>
          )}

          {error && (
            <div
              role="alert"
              className="text-caption text-danger bg-danger/10 border border-danger/30 rounded-md px-3 py-2"
            >
              {error}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-4 flex gap-2.5 border-t border-default">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 text-[13px] font-medium text-secondary bg-elevated hover:bg-base border border-default rounded-md py-2.5 transition-colors duration-base"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!form.name.trim() || !form.type || createMutation.isPending}
            className="flex-1 text-[13px] font-semibold text-white rounded-md py-2.5 transition-all duration-base ease-standard bg-brand-gradient hover:shadow-glow active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {createMutation.isPending
              ? "Guardando…"
              : isCategoria
                ? "Crear categoría"
                : "Crear cuenta"}
          </button>
        </div>
      </form>
    </div>
  );
}
