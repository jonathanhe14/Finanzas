import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, PiggyBank } from "lucide-react";
import { Sidebar } from "../../../components/Sidebar";
import { supabase } from "../../../lib/supabaseClient";
import { formatMoney } from "../../../lib/utils/money";
import { getMonthRange } from "../../../lib/utils/dates";
import { useAccountsList } from "../../accounts/hooks/useAccountsList";
import {
  useMonthlyBudget,
  useExpenseSpent,
  useUpsertBudgetLine,
  useCreateMonthlyBudget,
} from "../hooks/useBudgets";
import { BudgetRow } from "../components/BudgetRow";
import { FixedExpensesTab } from "../components/FixedExpensesTab";

const handleLogout = () => {
  supabase.auth.signOut();
};

export default function Presupuestos() {
  const navigate = useNavigate();
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [tab, setTab] = useState("categorias");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) navigate("/login");
    });
  }, [navigate]);

  const { from, to } = useMemo(
    () => getMonthRange(cursor.year, cursor.month),
    [cursor],
  );

  const { data: accounts = [], isLoading: loadingAccounts } = useAccountsList();
  const { data: budget, isLoading: loadingBudget, isError, error } = useMonthlyBudget();
  const { data: spentMap = {}, isLoading: loadingSpent } = useExpenseSpent(from, to);
  const upsertLine = useUpsertBudgetLine();
  const createBudget = useCreateMonthlyBudget();

  const isLoading = loadingAccounts || loadingBudget || loadingSpent;

  const expenseAccounts = useMemo(
    () => accounts.filter((a) => a.type === "EXPENSE"),
    [accounts],
  );

  const limitByAccount = useMemo(() => {
    const map = {};
    for (const line of budget?.budget_line ?? []) {
      map[line.account_id] = Number(line.limit_amount) || 0;
    }
    return map;
  }, [budget]);

  const rows = useMemo(
    () =>
      expenseAccounts.map((acc) => ({
        account_id: acc.id,
        categoria: acc.name,
        currency: acc.currency_code ?? "CRC",
        limite: limitByAccount[acc.id] ?? 0,
        gastado: Number(spentMap[acc.id] ?? 0),
      })),
    [expenseAccounts, limitByAccount, spentMap],
  );

  const totals = useMemo(() => {
    const presupuestado = rows.reduce((s, r) => s + r.limite, 0);
    const gastado = rows.reduce((s, r) => s + r.gastado, 0);
    return { presupuestado, gastado, restante: presupuestado - gastado };
  }, [rows]);

  const mesLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString("es-CR", {
    month: "long",
    year: "numeric",
  });
  const mesCapitalizado = mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1);

  function shiftMonth(delta) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function handleSaveLimit(account_id, limit_amount) {
    if (!budget?.id) return;
    upsertLine.mutate(
      { budget_id: budget.id, account_id, limit_amount },
      { onError: (e) => alert("Error al guardar el límite: " + (e?.message || String(e))) },
    );
  }

  function handleCreateBudget() {
    createBudget.mutate(undefined, {
      onError: (e) => alert("Error al crear el presupuesto: " + (e?.message || String(e))),
    });
  }

  return (
    <div className="min-h-screen w-full text-primary">
      <Sidebar handleLogout={handleLogout} />

      <div className="ml-[64px] flex flex-col min-h-screen">
        <header className="relative h-16 glass-panel border-b border-default flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent pointer-events-none" />

          <div>
            <h1 className="font-display text-h2 text-primary flex items-center gap-2">
              Presupuestos
              <span className="w-1 h-1 rounded-full bg-accent shadow-[0_0_6px_rgba(6,182,212,0.8)] animate-pulse-dot" />
            </h1>
            <p className="text-caption text-muted -mt-0.5">
              Límite por categoría y gasto del mes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-surface border border-default rounded-md p-0.5">
              {[
                { id: "categorias", label: "Por categoría" },
                { id: "fijos", label: "Gastos fijos" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`px-2.5 h-7 rounded-md text-[12px] font-medium transition-colors duration-base ${
                    tab === t.id
                      ? "bg-elevated text-primary"
                      : "text-muted hover:text-primary"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "categorias" && (
              <div className="flex items-center bg-surface border border-default rounded-md p-0.5">
                <button
                  type="button"
                  onClick={() => shiftMonth(-1)}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-muted hover:bg-elevated hover:text-primary transition-colors duration-base"
                  aria-label="Mes anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="num-chip px-2.5 text-[12px] text-primary font-medium capitalize">
                  {mesCapitalizado}
                </span>
                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-muted hover:bg-elevated hover:text-primary transition-colors duration-base"
                  aria-label="Mes siguiente"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="p-6 lg:p-8 max-w-4xl w-full mx-auto flex-1 animate-fade-up">
          {tab === "fijos" && <FixedExpensesTab />}

          {tab === "categorias" && (
          <>
          {isError && (
            <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 mb-4">
              Error al cargar: {error?.message}
            </div>
          )}

          {isLoading && (
            <div className="space-y-2">
              <div className="skeleton h-[112px]" />
              <div className="skeleton h-[112px]" />
              <div className="skeleton h-[112px]" />
            </div>
          )}

          {!isLoading && !isError && !budget && (
            <div className="bg-elevated border border-dashed border-default rounded-2xl px-6 py-12 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center mb-3 ring-1 ring-inset ring-white/5">
                <PiggyBank className="w-5 h-5 text-muted" strokeWidth={1.75} />
              </div>
              <p className="text-sm text-primary font-medium">Aún no tienes un presupuesto</p>
              <p className="text-caption text-muted mt-1 mb-4">
                Crea tu presupuesto mensual para asignar un límite a cada categoría
              </p>
              <button
                type="button"
                onClick={handleCreateBudget}
                disabled={createBudget.isPending}
                className="bg-brand-gradient text-white text-[12px] font-semibold rounded-md px-3.5 py-2 hover:shadow-glow-lg active:scale-[0.97] transition-all duration-base ease-standard disabled:opacity-60"
              >
                {createBudget.isPending ? "Creando…" : "Crear presupuesto"}
              </button>
            </div>
          )}

          {!isLoading && !isError && budget && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <StatTile label="Presupuestado" value={formatMoney(totals.presupuestado)} />
                <StatTile label="Gastado" value={formatMoney(totals.gastado)} tone="danger" />
                <StatTile
                  label="Restante"
                  value={formatMoney(totals.restante)}
                  tone={totals.restante < 0 ? "danger" : "success"}
                />
              </div>

              {rows.length === 0 ? (
                <div className="bg-elevated border border-dashed border-default rounded-2xl px-6 py-12 text-center">
                  <p className="text-sm text-primary font-medium">No hay categorías de gasto</p>
                  <p className="text-caption text-muted mt-1">
                    Crea categorías de tipo gasto en la sección Cuentas
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {rows.map((r) => (
                    <BudgetRow
                      key={r.account_id}
                      categoria={r.categoria}
                      limite={r.limite}
                      gastado={r.gastado}
                      currency={r.currency}
                      disabled={upsertLine.isPending}
                      onSave={(limit) => handleSaveLimit(r.account_id, limit)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
          </>
          )}
        </main>
      </div>
    </div>
  );
}

function StatTile({ label, value, tone }) {
  const valueClass =
    tone === "danger" ? "text-danger" : tone === "success" ? "text-success" : "text-primary";
  return (
    <div className="bg-surface border border-default rounded-2xl p-4 shadow-card">
      <p className="text-caption text-muted">{label}</p>
      <p className={`amount text-num-md mt-1 ${valueClass}`}>{value}</p>
    </div>
  );
}
