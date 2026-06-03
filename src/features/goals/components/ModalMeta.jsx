import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { useAccountsList } from "../../accounts/hooks/useAccountsList";
import { useCreateGoal, useUpdateGoal } from "../hooks/useGoals";
import { useModalTransition } from "../../../lib/hooks/useModalTransition";

const today = () => new Date().toISOString().slice(0, 10);

const DEFAULT_FORM = {
  name: "",
  description: "",
  target_amount: "",
  currency_code: "CRC",
  start_date: today(),
  due_date: "",
  linked_account_id: "",
};

const inputCls =
  "w-full bg-sunken border border-default rounded-md px-3.5 py-2.5 text-body font-medium text-primary placeholder:text-faint focus:outline-none focus:border-accent focus:shadow-focus transition-all duration-base";
const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
};

export default function ModalMeta({ isOpen, onClose, goal = null }) {
  const isEdit = !!goal;
  const [form, setForm] = useState(DEFAULT_FORM);
  const [error, setError] = useState(null);
  const visible = useModalTransition(isOpen);

  const { data: accounts = [] } = useAccountsList();
  const assetAccounts = accounts.filter((a) => a.type === "ASSET");
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal();
  const mutation = isEdit ? updateMutation : createMutation;

  // Reset del formulario al abrir (ajuste de estado en render, no en efecto).
  const [prevOpen, setPrevOpen] = useState(false);
  if (isOpen && !prevOpen) {
    setPrevOpen(true);
    setError(null);
    setForm(
      isEdit
        ? {
            name: goal.name ?? "",
            description: goal.description ?? "",
            target_amount: goal.target_amount != null ? String(goal.target_amount) : "",
            currency_code: goal.currency_code ?? "CRC",
            start_date: (goal.start_date ?? today()).slice(0, 10),
            due_date: (goal.due_date ?? "").slice(0, 10),
            linked_account_id: goal.linked_account_id != null ? String(goal.linked_account_id) : "",
          }
        : DEFAULT_FORM,
    );
  }
  if (!isOpen && prevOpen) setPrevOpen(false);

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

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) return setError("Ponle un nombre a tu meta");
    if (!form.target_amount || Number(form.target_amount) <= 0) {
      return setError("El monto objetivo debe ser mayor a 0");
    }
    if (!form.due_date) return setError("Elegí una fecha objetivo");

    const payload = {
      name: form.name,
      description: form.description,
      currency_code: form.currency_code,
      target_amount: form.target_amount,
      start_date: form.start_date,
      due_date: form.due_date,
      linked_account_id: form.linked_account_id || null,
    };

    try {
      if (isEdit) await updateMutation.mutateAsync({ id: goal.id, ...payload });
      else await createMutation.mutateAsync(payload);
      onClose();
    } catch (err) {
      setError(err.message || "No se pudo guardar");
    }
  }

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-slow ${isOpen ? "opacity-100" : "opacity-0"}`}>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className={`relative z-[101] bg-surface rounded-3xl w-full max-w-[480px] mx-4 my-auto max-h-[90vh] flex flex-col transition-all duration-slow ease-standard shadow-modal ${isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-[0.96]"}`}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-default">
          <div>
            <h2 className="font-display text-h2 text-primary">{isEdit ? "Editar meta" : "Nueva meta"}</h2>
            <p className="text-caption text-muted mt-1">Define cuánto querés ahorrar y para cuándo</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg bg-elevated hover:bg-base flex items-center justify-center transition-colors duration-base flex-shrink-0" aria-label="Cerrar">
            <X className="w-3.5 h-3.5 text-muted" strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto thin-scroll max-h-[70vh]">
          <div>
            <label className="block text-eyebrow text-muted uppercase mb-2">Nombre</label>
            <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej. Vacaciones, Fondo de emergencia…" autoFocus className={inputCls} />
          </div>

          <div>
            <label className="block text-eyebrow text-muted uppercase mb-2">Monto objetivo</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 amount text-num-md text-faint pointer-events-none">₡</span>
              <input type="number" step="any" min="0" value={form.target_amount} onChange={(e) => setForm((f) => ({ ...f, target_amount: e.target.value }))} placeholder="0.00" className={`${inputCls} amount pl-9`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-eyebrow text-muted uppercase mb-2">Inicio</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-eyebrow text-muted uppercase mb-2">Fecha objetivo</label>
              <input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-eyebrow text-muted uppercase mb-2">Cuenta vinculada (opcional)</label>
            <select value={form.linked_account_id} onChange={(e) => setForm((f) => ({ ...f, linked_account_id: e.target.value }))} className={`${inputCls} appearance-none`} style={selectStyle}>
              <option value="" className="bg-surface">Sin vincular</option>
              {assetAccounts.map((a) => (
                <option key={a.id} value={a.id} className="bg-surface">{a.name}</option>
              ))}
            </select>
            <p className="text-[10px] text-muted mt-1.5">El saldo de la cuenta vinculada se usa como progreso de la meta.</p>
          </div>

          <div>
            <label className="block text-eyebrow text-muted uppercase mb-2">Notas (opcional)</label>
            <input type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Detalle de la meta" className={inputCls} />
          </div>

          {error && (
            <div role="alert" className="text-caption text-danger bg-danger/10 border border-danger/30 rounded-md px-3 py-2">{error}</div>
          )}
        </div>

        <div className="px-6 pb-6 pt-4 flex gap-2.5 border-t border-default">
          <button type="button" onClick={onClose} className="flex-1 text-[13px] font-medium text-secondary bg-elevated hover:bg-base border border-default rounded-md py-2.5 transition-colors duration-base">Cancelar</button>
          <button type="submit" disabled={mutation.isPending} className="flex-1 text-[13px] font-semibold text-white rounded-md py-2.5 transition-all duration-base ease-standard bg-brand-gradient hover:shadow-glow active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
            {mutation.isPending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear meta"}
          </button>
        </div>
      </form>
    </div>
  );
}
