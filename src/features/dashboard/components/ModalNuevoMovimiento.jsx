import { useState, useEffect, useCallback, useMemo } from "react";
import { X, TrendingDown, TrendingUp, ArrowRight } from "lucide-react";
import { useAccountsList } from "../../accounts/hooks/useAccountsList";

const TYPE_META = {
  gasto: {
    label: "Registrar gasto",
    Icon: TrendingDown,
    color: "text-danger",
    bg: "bg-danger/10",
    border: "border-danger/30",
    btn: "bg-danger hover:shadow-[0_0_24px_-4px_rgba(244,63,94,0.5)]",
  },
  ingreso: {
    label: "Registrar ingreso",
    Icon: TrendingUp,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
    btn: "bg-success hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.5)]",
  },
  transferencia: {
    label: "Registrar transferencia",
    Icon: ArrowRight,
    color: "text-info",
    bg: "bg-info/10",
    border: "border-info/30",
    btn: "bg-info hover:shadow-[0_0_24px_-4px_rgba(56,189,248,0.5)]",
  },
};

function FieldLabel({ children }) {
  return (
    <label className="block text-eyebrow text-muted uppercase mb-2">{children}</label>
  );
}

function SelectField({ value, onChange, placeholder, options, disabled }) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full bg-sunken border border-default rounded-md px-3.5 py-2.5 text-body font-medium text-primary focus:outline-none focus:border-accent focus:shadow-focus transition-all duration-base appearance-none disabled:opacity-50"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
      }}
    >
      {placeholder && (
        <option value="" disabled className="bg-surface">
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-surface">
          {o.label}
        </option>
      ))}
    </select>
  );
}

function EmptyHint({ children }) {
  return (
    <div className="text-caption text-muted bg-elevated border border-dashed border-default rounded-md px-3 py-2">
      {children}
    </div>
  );
}

const defaultForm = {
  nombre: "",
  monto: "",
  tipo: "gasto",
  cuentaOrigenId: "",
  cuentaDestinoId: "",
};

export default function ModalNuevoMovimiento({ isOpen, onClose, onSave, isSaving = false }) {
  const [form, setForm] = useState(defaultForm);
  const [visible, setVisible] = useState(false);

  const { data: accounts = [], isLoading: loadingAccounts } = useAccountsList();

  const { paymentAccounts, expenseCategories, incomeCategories } = useMemo(() => {
    return {
      paymentAccounts: accounts.filter((a) => a.type === "ASSET" || a.type === "LIABILITY"),
      expenseCategories: accounts.filter((a) => a.type === "EXPENSE"),
      incomeCategories: accounts.filter((a) => a.type === "INCOME"),
    };
  }, [accounts]);

  useEffect(() => {
    if (isOpen) setVisible(true);
    else {
      const t = setTimeout(() => setVisible(false), 280);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setForm(defaultForm);
  }, [isOpen]);

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

  const meta = TYPE_META[form.tipo];

  function handleSave() {
    if (!form.nombre.trim() || !form.monto) return;
    if (!form.cuentaOrigenId || !form.cuentaDestinoId) return;
    onSave({
      ...form,
      monto: parseFloat(form.monto),
      cuentaOrigenId: Number(form.cuentaOrigenId),
      cuentaDestinoId: Number(form.cuentaDestinoId),
    });
  }

  const accOptions = (list) => list.map((a) => ({ value: String(a.id), label: a.name }));

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

      <div
        className={`relative z-[101] bg-surface rounded-3xl w-full max-w-[480px] mx-4 my-auto max-h-[90vh] flex flex-col transition-all duration-slow ease-standard shadow-modal ${
          isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-[0.96]"
        }`}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-default">
          <div>
            <h2 className="font-display text-h2 text-primary">Nuevo movimiento</h2>
            <p className="text-caption text-muted mt-1">
              Registra un ingreso, gasto o transferencia
            </p>
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
            <FieldLabel>Tipo</FieldLabel>
            <div className="grid grid-cols-3 gap-1.5 bg-sunken p-1 rounded-xl border border-default">
              {["gasto", "ingreso", "transferencia"].map((t) => {
                const m = TYPE_META[t];
                const Icon = m.Icon;
                const active = form.tipo === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...defaultForm,
                        nombre: f.nombre,
                        monto: f.monto,
                        tipo: t,
                      }))
                    }
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all duration-base ease-standard ${
                      active
                        ? `${m.bg} ${m.color} border ${m.border}`
                        : "text-muted hover:text-secondary hover:bg-elevated border border-transparent"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={2.25} />
                    <span className="text-[11px] font-semibold capitalize">{t}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <FieldLabel>Nombre</FieldLabel>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej. Supermercado, Salario…"
              className="w-full bg-sunken border border-default rounded-md px-3.5 py-2.5 text-body font-medium text-primary placeholder:text-faint focus:outline-none focus:border-accent focus:shadow-focus transition-all duration-base"
            />
          </div>

          <div>
            <FieldLabel>Monto</FieldLabel>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 amount text-num-md text-faint pointer-events-none">
                ₡
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.monto}
                onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))}
                placeholder="0.00"
                className="w-full bg-sunken border border-default rounded-md pl-9 pr-3.5 py-2.5 amount text-num-md tracking-tight text-primary placeholder:text-faint focus:outline-none focus:border-accent focus:shadow-focus transition-all duration-base"
              />
            </div>
          </div>

          {loadingAccounts && (
            <div className="space-y-2">
              <div className="skeleton h-[42px]" />
              <div className="skeleton h-[42px]" />
            </div>
          )}

          {!loadingAccounts && form.tipo === "gasto" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <FieldLabel>Cuenta de pago</FieldLabel>
                {paymentAccounts.length === 0 ? (
                  <EmptyHint>
                    Aún no tienes cuentas. Crea una en la pestaña Cuentas.
                  </EmptyHint>
                ) : (
                  <SelectField
                    value={form.cuentaOrigenId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, cuentaOrigenId: e.target.value }))
                    }
                    placeholder="Selecciona una cuenta"
                    options={accOptions(paymentAccounts)}
                  />
                )}
              </div>

              <div>
                <FieldLabel>Categoría</FieldLabel>
                {expenseCategories.length === 0 ? (
                  <EmptyHint>
                    Sin categorías de gasto. Crea una en Cuentas → Categorías.
                  </EmptyHint>
                ) : (
                  <SelectField
                    value={form.cuentaDestinoId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, cuentaDestinoId: e.target.value }))
                    }
                    placeholder="Selecciona una categoría"
                    options={accOptions(expenseCategories)}
                  />
                )}
              </div>
            </div>
          )}

          {!loadingAccounts && form.tipo === "ingreso" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <FieldLabel>Cuenta de destino</FieldLabel>
                {paymentAccounts.length === 0 ? (
                  <EmptyHint>
                    Aún no tienes cuentas. Crea una en la pestaña Cuentas.
                  </EmptyHint>
                ) : (
                  <SelectField
                    value={form.cuentaDestinoId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, cuentaDestinoId: e.target.value }))
                    }
                    placeholder="Selecciona una cuenta"
                    options={accOptions(paymentAccounts)}
                  />
                )}
              </div>

              <div>
                <FieldLabel>Categoría del ingreso</FieldLabel>
                {incomeCategories.length === 0 ? (
                  <EmptyHint>
                    Sin categorías de ingreso. Crea una en Cuentas → Categorías.
                  </EmptyHint>
                ) : (
                  <SelectField
                    value={form.cuentaOrigenId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, cuentaOrigenId: e.target.value }))
                    }
                    placeholder="Selecciona una categoría"
                    options={accOptions(incomeCategories)}
                  />
                )}
              </div>
            </div>
          )}

          {!loadingAccounts && form.tipo === "transferencia" && (
            <div className="space-y-3 animate-fade-in">
              <div>
                <FieldLabel>Cuenta de origen</FieldLabel>
                {paymentAccounts.length < 2 ? (
                  <EmptyHint>Necesitas al menos 2 cuentas para transferir.</EmptyHint>
                ) : (
                  <SelectField
                    value={form.cuentaOrigenId}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        cuentaOrigenId: e.target.value,
                        cuentaDestinoId:
                          f.cuentaDestinoId === e.target.value ? "" : f.cuentaDestinoId,
                      }))
                    }
                    placeholder="Selecciona cuenta origen"
                    options={accOptions(paymentAccounts)}
                  />
                )}
              </div>

              <div className="flex items-center gap-3 py-0.5">
                <div className="flex-1 h-px bg-white/10" />
                <div className="w-7 h-7 rounded-full bg-info/10 border border-info/30 flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 text-info" strokeWidth={2.5} />
                </div>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div>
                <FieldLabel>Cuenta de destino</FieldLabel>
                {paymentAccounts.length < 2 ? (
                  <EmptyHint>Necesitas al menos 2 cuentas para transferir.</EmptyHint>
                ) : (
                  <SelectField
                    value={form.cuentaDestinoId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, cuentaDestinoId: e.target.value }))
                    }
                    placeholder="Selecciona cuenta destino"
                    options={accOptions(
                      paymentAccounts.filter((a) => String(a.id) !== form.cuentaOrigenId),
                    )}
                    disabled={!form.cuentaOrigenId}
                  />
                )}
              </div>
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
            type="button"
            onClick={handleSave}
            disabled={
              !form.nombre.trim() ||
              !form.monto ||
              !form.cuentaOrigenId ||
              !form.cuentaDestinoId ||
              isSaving
            }
            className={`flex-1 text-[13px] font-semibold text-white rounded-md py-2.5 transition-all duration-base ease-standard active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${meta.btn}`}
          >
            {isSaving ? "Guardando…" : meta.label}
          </button>
        </div>
      </div>
    </div>
  );
}
