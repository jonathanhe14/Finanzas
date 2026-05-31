import { useState, useMemo } from "react";
import { Plus, CalendarClock } from "lucide-react";
import { formatMoney } from "../../../lib/utils/money";
import {
  useScheduledEntries,
  usePostScheduledEntry,
  useSetScheduledActive,
} from "../hooks/useScheduled";
import { FixedExpenseCard } from "./FixedExpenseCard";
import ModalGastoFijo from "./ModalGastoFijo";

function StatTile({ label, value, tone }) {
  const valueClass = tone === "danger" ? "text-danger" : "text-primary";
  return (
    <div className="bg-surface border border-default rounded-2xl p-4 shadow-card">
      <p className="text-caption text-muted">{label}</p>
      <p className={`amount text-num-md mt-1 ${valueClass}`}>{value}</p>
    </div>
  );
}

export function FixedExpensesTab() {
  const { data: entries = [], isLoading, isError, error } = useScheduledEntries();
  const payMutation = usePostScheduledEntry();
  const setActive = useSetScheduledActive();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [payingId, setPayingId] = useState(null);

  const totals = useMemo(() => {
    let mensual = 0;
    let deuda = 0;
    for (const e of entries) {
      const cuota = Number(e.installment_amount) || 0;
      if ((e.rrule || "").toUpperCase().includes("MONTHLY")) mensual += cuota;
      if (e.total_installments != null) {
        const restantes = Math.max(Number(e.total_installments) - (Number(e.completed_installments) || 0), 0);
        deuda += restantes * cuota;
      }
    }
    const proximo = entries.length
      ? entries.reduce((min, e) => (e.next_run_date < min ? e.next_run_date : min), entries[0].next_run_date)
      : null;
    return { mensual, deuda, proximo };
  }, [entries]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(entry) {
    setEditing(entry);
    setModalOpen(true);
  }

  function handlePay(entry) {
    if (!window.confirm(`¿Registrar el pago de "${entry.name}" por ${formatMoney(entry.installment_amount, entry.currency_code)}?`)) {
      return;
    }
    setPayingId(entry.id);
    payMutation.mutate(
      { id: entry.id },
      {
        onError: (e) => alert("Error al registrar el pago: " + (e?.message || String(e))),
        onSettled: () => setPayingId(null),
      },
    );
  }

  function handlePause(entry) {
    if (!window.confirm(`¿Pausar "${entry.name}"? Dejará de aparecer en la lista.`)) return;
    setActive.mutate(
      { id: entry.id, is_active: false },
      { onError: (e) => alert("Error al pausar: " + (e?.message || String(e))) },
    );
  }

  let proximoLabel = "—";
  if (totals.proximo) {
    const [y, m, d] = totals.proximo.slice(0, 10).split("-").map(Number);
    proximoLabel = new Date(y, m - 1, d).toLocaleDateString("es-CR", { day: "numeric", month: "short" });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-caption text-muted">Suscripciones, préstamos y compras a cuotas</p>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-brand-gradient text-white text-[12px] font-semibold rounded-md px-3 py-1.5 hover:shadow-glow active:scale-[0.97] transition-all duration-base"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          Nuevo gasto fijo
        </button>
      </div>

      {isError && (
        <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 mb-4">
          Error al cargar: {error?.message}
        </div>
      )}

      {isLoading && (
        <div className="space-y-2">
          <div className="skeleton h-[120px]" />
          <div className="skeleton h-[120px]" />
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {entries.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <StatTile label="Mensual comprometido" value={formatMoney(totals.mensual)} />
              <StatTile label="Deuda restante" value={formatMoney(totals.deuda)} tone="danger" />
              <StatTile label="Próximo pago" value={proximoLabel} />
            </div>
          )}

          {entries.length === 0 ? (
            <div className="bg-elevated border border-dashed border-default rounded-2xl px-6 py-12 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center mb-3 ring-1 ring-inset ring-white/5">
                <CalendarClock className="w-5 h-5 text-muted" strokeWidth={1.75} />
              </div>
              <p className="text-sm text-primary font-medium">Aún no tienes gastos fijos</p>
              <p className="text-caption text-muted mt-1 mb-4">
                Agrega tus suscripciones y deudas para seguir su estado
              </p>
              <button
                type="button"
                onClick={openCreate}
                className="bg-brand-gradient text-white text-[12px] font-semibold rounded-md px-3.5 py-2 hover:shadow-glow-lg active:scale-[0.97] transition-all duration-base"
              >
                Nuevo gasto fijo
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {entries.map((entry) => (
                <FixedExpenseCard
                  key={entry.id}
                  entry={entry}
                  paying={payingId === entry.id}
                  disabled={setActive.isPending || (payMutation.isPending && payingId !== entry.id)}
                  onPay={() => handlePay(entry)}
                  onEdit={() => openEdit(entry)}
                  onPause={() => handlePause(entry)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <ModalGastoFijo isOpen={modalOpen} onClose={() => setModalOpen(false)} entry={editing} />
    </div>
  );
}
