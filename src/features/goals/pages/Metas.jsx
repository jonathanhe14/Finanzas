import { useState, useMemo } from "react";
import { Plus, Target } from "lucide-react";
import { Sidebar } from "../../../components/Sidebar";
import { MobileMenuButton } from "../../../components/MobileMenuButton";
import { supabase } from "../../../lib/supabaseClient";
import { formatMoney } from "../../../lib/utils/money";
import { useAccountBalances } from "../../accounts/hooks/useAccountsList";
import { useGoals, useDeleteGoal, useSetGoalActive } from "../hooks/useGoals";
import { GoalCard } from "../components/GoalCard";
import ModalMeta from "../components/ModalMeta";
import { useToast } from "../../../components/ToastProvider";

const handleLogout = () => supabase.auth.signOut();

function StatTile({ label, value, tone }) {
  const valueClass =
    tone === "success" ? "text-success" : tone === "accent" ? "text-accent" : "text-primary";
  return (
    <div className="bg-surface border border-default rounded-2xl p-4 shadow-card">
      <p className="text-caption text-muted">{label}</p>
      <p className={`amount text-num-md mt-1 ${valueClass}`}>{value}</p>
    </div>
  );
}

export default function Metas() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const { data: goals = [], isLoading, isError, error } = useGoals();
  const { data: balances = {} } = useAccountBalances();
  const deleteGoal = useDeleteGoal();
  const setActive = useSetGoalActive();
  const toast = useToast();

  const savedFor = (goal) =>
    goal.linked_account_id != null ? Number(balances[goal.linked_account_id] ?? 0) : 0;

  const totals = useMemo(() => {
    let objetivo = 0;
    let ahorrado = 0;
    for (const g of goals) {
      objetivo += Number(g.target_amount) || 0;
      ahorrado += savedFor(g);
    }
    const pct = objetivo > 0 ? Math.round((ahorrado / objetivo) * 100) : 0;
    return { objetivo, ahorrado, pct };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals, balances]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(goal) {
    setEditing(goal);
    setModalOpen(true);
  }

  function handleDelete(goal) {
    if (!window.confirm(`¿Eliminar la meta "${goal.name}"? Esta acción no se puede deshacer.`)) return;
    setBusyId(goal.id);
    deleteGoal.mutate(goal.id, {
      onSuccess: () => toast.success("Meta eliminada"),
      onError: (e) => toast.error("Error al eliminar: " + (e?.message || String(e))),
      onSettled: () => setBusyId(null),
    });
  }

  function handleComplete(goal) {
    if (!window.confirm(`¿Marcar "${goal.name}" como completada? Saldrá de la lista de metas activas.`)) return;
    setBusyId(goal.id);
    setActive.mutate(
      { id: goal.id, is_active: false },
      {
        onSuccess: () => toast.success("¡Meta completada! 🎉"),
        onError: (e) => toast.error("Error: " + (e?.message || String(e))),
        onSettled: () => setBusyId(null),
      },
    );
  }

  return (
    <div className="min-h-screen w-full text-primary">
      <Sidebar handleLogout={handleLogout} />

      <div className="md:ml-[64px] flex flex-col min-h-screen">
        <header className="relative min-h-16 glass-panel border-b border-default flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-2.5 sm:py-0 sm:h-16 sticky top-0 z-30">
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent pointer-events-none" />
          <div className="flex items-center gap-2.5">
            <MobileMenuButton />
            <div>
              <h1 className="font-display text-h2 text-primary flex items-center gap-2">
                Metas
                <span className="w-1 h-1 rounded-full bg-accent shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse-dot" />
              </h1>
              <p className="text-caption text-muted -mt-0.5">Tus objetivos de ahorro</p>
            </div>
          </div>

          <button
            onClick={openCreate}
            type="button"
            className="group bg-brand-gradient text-white text-[12px] font-semibold rounded-md px-3.5 py-2 flex items-center gap-1.5 hover:shadow-glow active:scale-[0.97] transition-all duration-base ease-standard"
          >
            <Plus className="w-3.5 h-3.5 transition-transform duration-base group-hover:rotate-90" strokeWidth={2.5} />
            Nueva meta
          </button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto flex-1 animate-fade-up">
          {isError && (
            <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 mb-4">
              Error al cargar: {error?.message}
            </div>
          )}

          {isLoading && (
            <div className="space-y-2">
              <div className="skeleton h-[150px]" />
              <div className="skeleton h-[150px]" />
            </div>
          )}

          {!isLoading && !isError && goals.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <StatTile label="Objetivo total" value={formatMoney(totals.objetivo)} />
              <StatTile label="Ahorrado" value={formatMoney(totals.ahorrado)} tone="accent" />
              <StatTile label="Progreso global" value={`${totals.pct}%`} tone="success" />
            </div>
          )}

          {!isLoading && !isError && goals.length === 0 ? (
            <div className="bg-elevated border border-dashed border-default rounded-2xl px-6 py-12 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center mb-3 ring-1 ring-inset ring-white/5">
                <Target className="w-5 h-5 text-muted" strokeWidth={1.75} />
              </div>
              <p className="text-sm text-primary font-medium">Aún no tienes metas</p>
              <p className="text-caption text-muted mt-1 mb-4">
                Define un objetivo de ahorro y seguí tu progreso mes a mes
              </p>
              <button
                type="button"
                onClick={openCreate}
                className="bg-brand-gradient text-white text-[12px] font-semibold rounded-md px-3.5 py-2 hover:shadow-glow-lg active:scale-[0.97] transition-all duration-base ease-standard"
              >
                Crear mi primera meta
              </button>
            </div>
          ) : (
            !isLoading &&
            !isError && (
              <div className="space-y-2.5">
                {goals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    saved={savedFor(goal)}
                    busy={busyId === goal.id}
                    onEdit={() => openEdit(goal)}
                    onComplete={() => handleComplete(goal)}
                    onDelete={() => handleDelete(goal)}
                  />
                ))}
              </div>
            )
          )}
        </main>

        <ModalMeta isOpen={modalOpen} onClose={() => setModalOpen(false)} goal={editing} />
      </div>
    </div>
  );
}
