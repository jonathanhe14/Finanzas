import { useState, useEffect, useCallback } from "react";
import { X, Repeat, Landmark, CreditCard } from "lucide-react";
import { useAccountsList } from "../../accounts/hooks/useAccountsList";
import {
  useCreateScheduledEntry,
  useUpdateScheduledEntry,
  useScheduledPostings,
} from "../hooks/useScheduled";

const TYPE_OPTIONS = [
  { value: "SUBSCRIPTION", label: "Suscripción", hint: "Recurrente sin fin", Icon: Repeat },
  { value: "LOAN", label: "Préstamo", hint: "Deuda con cuotas", Icon: Landmark },
  { value: "INSTALLMENT", label: "Cuotas", hint: "Compra a plazos", Icon: CreditCard },
];

const RRULE_OPTIONS = [
  { value: "FREQ=MONTHLY", label: "Mensual" },
  { value: "FREQ=WEEKLY", label: "Semanal" },
  { value: "FREQ=YEARLY", label: "Anual" },
];

const today = () => new Date().toISOString().slice(0, 10);

const DEFAULT_FORM = {
  name: "",
  type: "SUBSCRIPTION",
  expense_account_id: "",
  payment_account_id: "",
  installment_amount: "",
  total_installments: "",
  total_amount: "",
  next_run_date: today(),
  start_date: today(),
  rrule: "FREQ=MONTHLY",
  description: "",
};

const inputCls =
  "w-full bg-sunken border border-default rounded-md px-3.5 py-2.5 text-body font-medium text-primary placeholder:text-faint focus:outline-none focus:border-accent focus:shadow-focus transition-all duration-base";
const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
};

export default function ModalGastoFijo({ isOpen, onClose, entry = null }) {
  const isEdit = !!entry;
  const [form, setForm] = useState(DEFAULT_FORM);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(null);

  const { data: accounts = [] } = useAccountsList();
  const createMutation = useCreateScheduledEntry();
  const updateMutation = useUpdateScheduledEntry();
  const { data: postings = [] } = useScheduledPostings(isEdit ? entry.id : null);

  const expenseAccounts = accounts.filter((a) => a.type === "EXPENSE");
  const paymentAccounts = accounts.filter((a) => a.type === "ASSET" || a.type === "LIABILITY");

  // Reinicia el formulario al abrir / mantiene montado durante la animación de cierre.
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setError(null);
      setForm(
        isEdit
          ? {
              name: entry.name ?? "",
              type: entry.type ?? "SUBSCRIPTION",
              expense_account_id: "",
              payment_account_id: "",
              installment_amount: entry.installment_amount ?? "",
              total_installments: entry.total_installments ?? "",
              total_amount: entry.total_amount ?? "",
              next_run_date: (entry.next_run_date ?? today()).slice(0, 10),
              start_date: (entry.start_date ?? today()).slice(0, 10),
              rrule: entry.rrule ?? "FREQ=MONTHLY",
              description: entry.description ?? "",
            }
          : DEFAULT_FORM,
      );
      return undefined;
    }
    const t = setTimeout(() => setVisible(false), 280);
    return () => clearTimeout(t);
  }, [isOpen, entry, isEdit]);

  // Prefill de las cuentas cuando llegan los postings (sólo en edición).
  useEffect(() => {
    if (!isOpen || !isEdit || !postings.length) return;
    const debit = postings.find((p) => Number(p.debit) > 0);
    const credit = postings.find((p) => Number(p.credit) > 0);
    setForm((f) => ({
      ...f,
      expense_account_id: f.expense_account_id || String(debit?.account_id ?? ""),
      payment_account_id: f.payment_account_id || String(credit?.account_id ?? ""),
    }));
  }, [postings, isOpen, isEdit]);

  const handleKey = useCallback((e) => { if (e.key === "Escape") onClose(); }, [onClose]);
  useEffect(() => {
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, handleKey]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!visible) return null;

  const isSubscription = form.type === "SUBSCRIPTION";
  const mutation = isEdit ? updateMutation : createMutation;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.expense_account_id || !form.payment_account_id) {
      setError("Completá nombre, cuenta de gasto y cuenta que paga");
      return;
    }

    const expenseAcc = accounts.find((a) => String(a.id) === String(form.expense_account_id));
    const payload = {
      name: form.name,
      type: form.type,
      currency_code: expenseAcc?.currency_code ?? "CRC",
      installment_amount: form.installment_amount,
      total_amount: form.total_amount === "" ? null : form.total_amount,
      total_installments: isSubscription || form.total_installments === "" ? null : form.total_installments,
      next_run_date: form.next_run_date,
      start_date: form.start_date,
      rrule: form.rrule,
      description: form.description.trim() || null,
      expense_account_id: Number(form.expense_account_id),
      payment_account_id: Number(form.payment_account_id),
    };

    try {
      if (isEdit) await updateMutation.mutateAsync({ id: entry.id, ...payload });
      else await createMutation.mutateAsync(payload);
      onClose();
    } catch (err) {
      setError(err.message || "No se pudo guardar");
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-slow ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className={`relative z-[101] bg-surface rounded-3xl w-full max-w-[480px] mx-4 my-auto max-h-[90vh] flex flex-col transition-all duration-slow ease-standard shadow-modal ${
          isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-[0.96]"
        }`}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-default">
          <div>
            <h2 className="font-display text-h2 text-primary">
              {isEdit ? "Editar gasto fijo" : "Nuevo gasto fijo"}
            </h2>
            <p className="text-caption text-muted mt-1">Suscripción, préstamo o compra a cuotas</p>
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
            <div className="grid grid-cols-3 gap-2">
              {TYPE_OPTIONS.map((opt) => {
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
                    <Icon className={`w-4 h-4 ${active ? "text-accent" : "text-muted"}`} strokeWidth={2} />
                    <span className="text-[13px] font-semibold leading-tight text-primary">{opt.label}</span>
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
              placeholder="Ej. Netflix, Préstamo carro…"
              autoFocus
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-eyebrow text-muted uppercase mb-2">Cuenta de gasto</label>
              <select
                value={form.expense_account_id}
                onChange={(e) => setForm((f) => ({ ...f, expense_account_id: e.target.value }))}
                className={`${inputCls} appearance-none`}
                style={selectStyle}
              >
                <option value="" className="bg-surface">Seleccionar…</option>
                {expenseAccounts.map((a) => (
                  <option key={a.id} value={a.id} className="bg-surface">{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-eyebrow text-muted uppercase mb-2">Pagar desde</label>
              <select
                value={form.payment_account_id}
                onChange={(e) => setForm((f) => ({ ...f, payment_account_id: e.target.value }))}
                className={`${inputCls} appearance-none`}
                style={selectStyle}
              >
                <option value="" className="bg-surface">Seleccionar…</option>
                {paymentAccounts.map((a) => (
                  <option key={a.id} value={a.id} className="bg-surface">{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-eyebrow text-muted uppercase mb-2">Monto por cuota</label>
              <input
                type="number"
                step="any"
                min="0"
                value={form.installment_amount}
                onChange={(e) => setForm((f) => ({ ...f, installment_amount: e.target.value }))}
                placeholder="0.00"
                className={`${inputCls} amount`}
              />
            </div>
            <div>
              <label className="block text-eyebrow text-muted uppercase mb-2">Recurrencia</label>
              <select
                value={form.rrule}
                onChange={(e) => setForm((f) => ({ ...f, rrule: e.target.value }))}
                className={`${inputCls} appearance-none`}
                style={selectStyle}
              >
                {RRULE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-surface">{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {!isSubscription && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-eyebrow text-muted uppercase mb-2">Total de cuotas</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={form.total_installments}
                  onChange={(e) => setForm((f) => ({ ...f, total_installments: e.target.value }))}
                  placeholder="Ej. 12"
                  className={`${inputCls} amount`}
                />
              </div>
              <div>
                <label className="block text-eyebrow text-muted uppercase mb-2">Monto total (opcional)</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={form.total_amount}
                  onChange={(e) => setForm((f) => ({ ...f, total_amount: e.target.value }))}
                  placeholder="0.00"
                  className={`${inputCls} amount`}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-eyebrow text-muted uppercase mb-2">Próximo pago</label>
              <input
                type="date"
                value={form.next_run_date}
                onChange={(e) => setForm((f) => ({ ...f, next_run_date: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-eyebrow text-muted uppercase mb-2">Inicio</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-eyebrow text-muted uppercase mb-2">Notas (opcional)</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Detalle del gasto fijo"
              className={inputCls}
            />
          </div>

          {error && (
            <div role="alert" className="text-caption text-danger bg-danger/10 border border-danger/30 rounded-md px-3 py-2">
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
            disabled={mutation.isPending}
            className="flex-1 text-[13px] font-semibold text-white rounded-md py-2.5 transition-all duration-base ease-standard bg-brand-gradient hover:shadow-glow active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear gasto fijo"}
          </button>
        </div>
      </form>
    </div>
  );
}
