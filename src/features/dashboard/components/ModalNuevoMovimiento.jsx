import { useState, useEffect, useCallback, useMemo } from "react";
import { X, TrendingDown, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { useAccountsList, useAccountBalances } from "../../accounts/hooks/useAccountsList";
import { useModalTransition } from "../../../lib/hooks/useModalTransition";
import { useTags, useCreateTag } from "../../movements/hooks/useTags";
import { formatMoney } from "../../../lib/utils/money";

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
  reconocer: {
    label: "Reconocer ganancia",
    Icon: Sparkles,
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/30",
    btn: "bg-accent hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.5)]",
  },
};

function FieldLabel({ children }) {
  return (
    <label className="block text-eyebrow text-muted uppercase mb-2">{children}</label>
  );
}

function SelectField({ value, onChange, placeholder, options = [], groups, disabled }) {
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
      {groups
        ? groups.map((g) => (
            <optgroup key={g.label} label={g.label} className="bg-surface">
              {g.options.map((o) => (
                <option key={o.value} value={o.value} className="bg-surface">
                  {o.label}
                </option>
              ))}
            </optgroup>
          ))
        : options.map((o) => (
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
  tags: [],
};

export default function ModalNuevoMovimiento({ isOpen, onClose, onSave, isSaving = false, initial = null }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(defaultForm);
  const visible = useModalTransition(isOpen);

  const { data: accounts = [], isLoading: loadingAccounts } = useAccountsList();
  const { data: balances = {} } = useAccountBalances();
  const { data: allTags = [] } = useTags();
  const createTag = useCreateTag();
  const [newTag, setNewTag] = useState("");

  const { paymentAccounts, expenseCategories, incomeCategories, liabilityAccounts } = useMemo(() => {
    return {
      paymentAccounts: accounts.filter((a) => a.type === "ASSET" || a.type === "LIABILITY"),
      expenseCategories: accounts.filter((a) => a.type === "EXPENSE"),
      incomeCategories: accounts.filter((a) => a.type === "INCOME"),
      liabilityAccounts: accounts.filter((a) => a.type === "LIABILITY"),
    };
  }, [accounts]);

  // Reset del formulario al abrir (ajuste de estado en render).
  const [prevOpen, setPrevOpen] = useState(false);
  if (isOpen && !prevOpen) {
    setPrevOpen(true);
    setForm(
      initial
        ? {
            nombre: initial.nombre ?? "",
            monto: initial.monto != null ? String(initial.monto) : "",
            tipo: initial.tipo ?? "gasto",
            cuentaOrigenId: initial.cuentaOrigenId != null ? String(initial.cuentaOrigenId) : "",
            cuentaDestinoId: initial.cuentaDestinoId != null ? String(initial.cuentaDestinoId) : "",
            tags: initial.tags ?? [],
          }
        : defaultForm,
    );
  }
  if (!isOpen && prevOpen) setPrevOpen(false);

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

  // "Reconocer ganancia": saldo actual de la deuda seleccionada y aviso si el
  // monto lo excede (el RPC lo rechaza, así que esto es una advertencia previa).
  const selectedLiability = liabilityAccounts.find(
    (a) => String(a.id) === form.cuentaOrigenId,
  );
  const liabilityBalance = selectedLiability ? balances[selectedLiability.id] : undefined;
  const reconocerExcedeSaldo =
    form.tipo === "reconocer" &&
    liabilityBalance != null &&
    !Number.isNaN(parseFloat(form.monto)) &&
    parseFloat(form.monto) > liabilityBalance;

  // El nombre/descripción es obligatorio salvo en "reconocer ganancia",
  // donde es opcional (el RPC pone una descripción por defecto).
  const nombreRequired = form.tipo !== "reconocer";
  const camposIncompletos =
    (nombreRequired && !form.nombre.trim()) ||
    !form.monto ||
    !form.cuentaOrigenId ||
    !form.cuentaDestinoId;

  function handleSave() {
    if (camposIncompletos) return;
    onSave({
      ...form,
      monto: parseFloat(form.monto),
      cuentaOrigenId: Number(form.cuentaOrigenId),
      cuentaDestinoId: Number(form.cuentaDestinoId),
    });
  }

  const accOptions = (list) => list.map((a) => ({ value: String(a.id), label: a.name }));

  // Preselección por nombre (con fallback a la primera cuenta del tipo).
  const pickDefaultId = (list, preferred) => {
    const match = list.find((a) => a.name.toLowerCase().includes(preferred));
    return String((match ?? list[0])?.id ?? "");
  };

  const toggleTag = (id) =>
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(id) ? f.tags.filter((t) => t !== id) : [...f.tags, id],
    }));

  async function addTag() {
    const name = newTag.trim();
    if (!name) return;
    try {
      const t = await createTag.mutateAsync(name);
      setForm((f) => ({ ...f, tags: [...f.tags, t.id] }));
      setNewTag("");
    } catch {
      /* el error se ignora aquí; el nombre queda para reintentar */
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center transition-opacity duration-slow ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      <div
        className={`relative z-[101] bg-surface rounded-t-3xl sm:rounded-3xl w-full sm:max-w-[480px] mx-0 sm:mx-4 max-h-[92vh] sm:max-h-[90vh] pb-[env(safe-area-inset-bottom)] sm:pb-0 flex flex-col transition-all duration-slow ease-standard shadow-modal ${
          isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-[0.96]"
        }`}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-default">
          <div>
            <h2 className="font-display text-h2 text-primary">
              {isEdit ? "Editar movimiento" : "Nuevo movimiento"}
            </h2>
            <p className="text-caption text-muted mt-1">
              {isEdit
                ? "Modifica los datos del movimiento"
                : "Registra un ingreso, gasto o transferencia"}
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
            <div className="grid grid-cols-2 gap-1.5 bg-sunken p-1 rounded-xl border border-default">
              {["gasto", "ingreso", "transferencia", "reconocer"].map((t) => {
                const m = TYPE_META[t];
                const Icon = m.Icon;
                const active = form.tipo === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setForm((f) => {
                        const base = {
                          ...defaultForm,
                          nombre: f.nombre,
                          monto: f.monto,
                          tipo: t,
                        };
                        if (t === "reconocer") {
                          base.cuentaOrigenId = pickDefaultId(
                            liabilityAccounts,
                            "fondos por depositar",
                          );
                          base.cuentaDestinoId = pickDefaultId(
                            incomeCategories,
                            "ganancias reparto",
                          );
                        }
                        return base;
                      })
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
            <FieldLabel>
              {form.tipo === "reconocer" ? "Descripción (opcional)" : "Nombre"}
            </FieldLabel>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              placeholder={
                form.tipo === "reconocer"
                  ? "Ej. Comisión reconocida…"
                  : "Ej. Supermercado, Salario…"
              }
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
                {expenseCategories.length === 0 && liabilityAccounts.length === 0 ? (
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
                    groups={[
                      {
                        label: "Categorías de gasto",
                        options: accOptions(expenseCategories),
                      },
                      {
                        label: "Préstamos / Pasivos",
                        options: accOptions(
                          liabilityAccounts.filter(
                            (a) => String(a.id) !== form.cuentaOrigenId,
                          ),
                        ),
                      },
                    ].filter((g) => g.options.length > 0)}
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
                {incomeCategories.length === 0 && liabilityAccounts.length === 0 ? (
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
                    groups={[
                      {
                        label: "Categorías de ingreso",
                        options: accOptions(incomeCategories),
                      },
                      {
                        label: "Préstamos / Pasivos",
                        options: accOptions(
                          liabilityAccounts.filter(
                            (a) => String(a.id) !== form.cuentaDestinoId,
                          ),
                        ),
                      },
                    ].filter((g) => g.options.length > 0)}
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

          {!loadingAccounts && form.tipo === "reconocer" && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-caption text-muted bg-accent/5 border border-accent/20 rounded-md px-3 py-2">
                Reclasifica dinero marcado como ajeno (un pasivo) a ingreso propio.
                No mueve dinero entre cuentas: ningún banco cambia.
              </div>

              <div>
                <FieldLabel>Cuenta de origen (pasivo)</FieldLabel>
                {liabilityAccounts.length === 0 ? (
                  <EmptyHint>
                    No tienes cuentas de pasivo. Crea una en la pestaña Cuentas.
                  </EmptyHint>
                ) : (
                  <SelectField
                    value={form.cuentaOrigenId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, cuentaOrigenId: e.target.value }))
                    }
                    placeholder="Selecciona el pasivo"
                    options={accOptions(liabilityAccounts)}
                  />
                )}
                {selectedLiability && liabilityBalance != null && (
                  <p className="text-caption text-muted mt-1.5">
                    Saldo de la deuda:{" "}
                    <span className="amount text-secondary">
                      {formatMoney(liabilityBalance, selectedLiability.currency_code)}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 py-0.5">
                <div className="flex-1 h-px bg-white/10" />
                <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-accent" strokeWidth={2.5} />
                </div>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div>
                <FieldLabel>Cuenta de destino (ingreso)</FieldLabel>
                {incomeCategories.length === 0 ? (
                  <EmptyHint>
                    Sin categorías de ingreso. Crea una en Cuentas → Categorías.
                  </EmptyHint>
                ) : (
                  <SelectField
                    value={form.cuentaDestinoId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, cuentaDestinoId: e.target.value }))
                    }
                    placeholder="Selecciona el ingreso"
                    options={accOptions(incomeCategories)}
                  />
                )}
              </div>

              {reconocerExcedeSaldo && (
                <div className="text-caption text-warning bg-warning/10 border border-warning/30 rounded-md px-3 py-2">
                  El monto supera el saldo de la deuda (
                  {formatMoney(liabilityBalance, selectedLiability.currency_code)}). No
                  puedes reconocer más ganancia de la que tenías marcada como ajena.
                </div>
              )}
            </div>
          )}

          <div>
            <FieldLabel>Etiquetas</FieldLabel>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {allTags.length === 0 && (
                <span className="text-caption text-faint">Sin etiquetas aún — crea una abajo</span>
              )}
              {allTags.map((t) => {
                const active = form.tags.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={`text-[11px] font-medium border px-2.5 py-1 rounded-full transition-colors duration-base ${
                      active
                        ? "bg-accent/15 text-accent border-accent/40"
                        : "text-muted border-default hover:text-primary hover:border-strong"
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Nueva etiqueta…"
                className="flex-1 bg-sunken border border-default rounded-md px-3 py-2 text-[12px] text-primary placeholder:text-faint focus:outline-none focus:border-accent transition-all duration-base"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!newTag.trim() || createTag.isPending}
                className="text-[12px] font-medium text-secondary bg-elevated border border-default rounded-md px-3 py-2 hover:text-primary transition-colors duration-base disabled:opacity-40"
              >
                Agregar
              </button>
            </div>
          </div>
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
            disabled={camposIncompletos || isSaving}
            className={`flex-1 text-[13px] font-semibold text-white rounded-md py-2.5 transition-all duration-base ease-standard active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${meta.btn}`}
          >
            {isSaving ? "Guardando…" : isEdit ? "Guardar cambios" : meta.label}
          </button>
        </div>
      </div>
    </div>
  );
}
