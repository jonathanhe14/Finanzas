import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { Sidebar } from "../../../components/Sidebar";
import { CardFlujo } from "../components/CardFlujo";
import { CardBalance } from "../components/CardBalance";
import { CardUltimosMovimientos } from "../components/CardUltimosMovimientos";
import { CardGastosCategoria } from "../components/CardGastosCategoria";
import { CardPresupuesto } from "../components/CardPresupuesto";
import ModalNuevoMovimiento from "../components/ModalNuevoMovimiento";
import { useDashboardReport } from "../hooks/useDashboardReport";
import { useRecentEntries } from "../hooks/useRecentEntries";
import { useCreateMovement } from "../hooks/useCreateMovement";
import { useAccountsList } from "../../accounts/hooks/useAccountsList";
import { useMonthlyBudget, useExpenseSpent } from "../../budgets/hooks/useBudgets";
import { getMonthRange } from "../../../lib/utils/dates";
import { useToast } from "../../../components/ToastProvider";

const handleLogout = () => {
  supabase.auth.signOut();
};

function Home() {
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();
  const createMovement = useCreateMovement();
  const toast = useToast();

  const now = new Date();
  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });
  const { from, to } = useMemo(
    () => getMonthRange(cursor.year, cursor.month),
    [cursor],
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) navigate("/login");
    });
  }, [navigate]);

  const { data: dashboardData } = useDashboardReport(from, to);
  const { data: recentEntries = [] } = useRecentEntries();
  const { data: accounts = [] } = useAccountsList();
  const { data: budget } = useMonthlyBudget();
  const { data: spentMap = {} } = useExpenseSpent(from, to);

  // --- Multi-moneda: nunca sumamos monedas distintas ---
  const byCurrency = useMemo(() => dashboardData?.by_currency ?? [], [dashboardData]);
  const primaryCurrency = dashboardData?.primary_currency ?? "CRC";
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const activeCurrency = selectedCurrency ?? primaryCurrency;

  const cdata = useMemo(() => {
    const found = byCurrency.find((c) => c.currency_code === activeCurrency);
    return (
      found ?? {
        expense_total: 0,
        income_total: 0,
        asset_balance: 0,
        liability_balance: 0,
      }
    );
  }, [byCurrency, activeCurrency]);

  const expenseByCat = useMemo(
    () =>
      (dashboardData?.expense_by_category ?? []).filter(
        (c) => c.currency_code === activeCurrency,
      ),
    [dashboardData, activeCurrency],
  );

  // Mes anterior (para la comparación %).
  const prevRange = useMemo(() => {
    const d = new Date(cursor.year, cursor.month - 1, 1);
    return getMonthRange(d.getFullYear(), d.getMonth());
  }, [cursor]);
  const { data: prevDashboard } = useDashboardReport(prevRange.from, prevRange.to);
  const pdata = useMemo(() => {
    const list = prevDashboard?.by_currency ?? [];
    return list.find((c) => c.currency_code === activeCurrency) ?? null;
  }, [prevDashboard, activeCurrency]);

  const pctChange = (curr, prev) => {
    const c = Number(curr) || 0;
    const p = Number(prev) || 0;
    if (p === 0) return 0; // sin base de comparación → la tarjeta muestra "—"
    return ((c - p) / p) * 100;
  };
  const expensePct = pctChange(cdata.expense_total, pdata?.expense_total);
  const incomePct = pctChange(cdata.income_total, pdata?.income_total);

  function shiftMonth(delta) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  const presupuestos = useMemo(() => {
    if (!budget?.budget_line?.length) return [];
    const nameById = Object.fromEntries(accounts.map((a) => [a.id, a.name]));
    return budget.budget_line
      .filter((line) => Number(line.limit_amount) > 0)
      .map((line) => ({
        categoria: nameById[line.account_id] ?? "Categoría",
        gastado: Number(spentMap[line.account_id] ?? 0),
        presupuestado: Number(line.limit_amount),
      }))
      .sort((a, b) => b.gastado / b.presupuestado - a.gastado / a.presupuestado)
      .slice(0, 5);
  }, [budget, accounts, spentMap]);

  async function asyncHandleSave(movement) {
    try {
      await createMovement.mutateAsync({
        entry_date: new Date().toISOString().slice(0, 10),
        description: movement.nombre,
        amount: movement.monto,
        currency_code: "CRC",
        debit_account_id: movement.cuentaDestinoId,
        credit_account_id: movement.cuentaOrigenId,
        memo: movement.nombre,
        tags: movement.tags,
      });
      setOpenModal(false);
      toast.success("Movimiento guardado");
    } catch (e) {
      toast.error("Error al guardar el movimiento: " + (e.message || String(e)));
    }
  }

  const mesLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(
    "es-CR",
    { month: "long", year: "numeric" },
  );
  const mesCapitalizado = mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1);

  return (
    <div className="min-h-screen w-full text-primary">
      <Sidebar handleLogout={handleLogout} />

      <div className="ml-[64px] flex flex-col min-h-screen">
        <header className="relative min-h-16 glass-panel border-b border-default flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-2.5 sm:py-0 sm:h-16 sticky top-0 z-30">
          {/* Bottom accent line on header */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent pointer-events-none" />

          <div>
            <h1 className="font-display text-h2 text-primary flex items-center gap-2">
              Dashboard
              <span className="w-1 h-1 rounded-full bg-accent shadow-[0_0_6px_rgba(6,182,212,0.8)] animate-pulse-dot" />
            </h1>
            <p className="text-caption text-muted -mt-0.5">
              Resumen del período actual
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {byCurrency.length > 1 && (
              <div className="flex items-center bg-surface border border-default rounded-md p-0.5">
                {byCurrency.map((c) => (
                  <button
                    key={c.currency_code}
                    type="button"
                    onClick={() => setSelectedCurrency(c.currency_code)}
                    className={`px-2.5 h-7 rounded-md text-[12px] font-semibold transition-colors duration-base ${
                      activeCurrency === c.currency_code
                        ? "bg-elevated text-primary"
                        : "text-muted hover:text-primary"
                    }`}
                  >
                    {c.currency_code}
                  </button>
                ))}
              </div>
            )}

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

            <button
              onClick={() => setOpenModal(true)}
              type="button"
              className="group bg-brand-gradient text-white text-[12px] font-semibold rounded-md px-3.5 py-2 flex items-center gap-1.5 hover:shadow-glow-lg active:scale-[0.97] transition-all duration-base ease-standard"
            >
              <Plus
                className="w-3.5 h-3.5 transition-transform duration-base group-hover:rotate-90"
                strokeWidth={2.5}
              />
              Nuevo movimiento
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <CardFlujo
              trending="down"
              nombre="Gasto del mes"
              saldo={cdata.expense_total}
              currency={activeCurrency}
              porcentaje={expensePct}
              descripcion="vs mes pasado"
            />
            <CardFlujo
              trending="up"
              nombre="Ingreso del mes"
              saldo={cdata.income_total}
              currency={activeCurrency}
              porcentaje={incomePct}
              descripcion="vs mes pasado"
            />
            <CardBalance
              nombre="Balance disponible"
              saldo={cdata.asset_balance}
              currency={activeCurrency}
              tipo="ASSET"
              detalles="Disponible para gastar"
            />
            <CardBalance
              nombre="Deuda de tarjeta"
              saldo={cdata.liability_balance}
              currency={activeCurrency}
              tipo="LIABILITY"
              detalles="Saldo pendiente"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 lg:row-span-2 min-h-[420px]">
              <CardUltimosMovimientos movimientos={recentEntries} />
            </div>

            <div className="lg:col-span-4">
              <CardGastosCategoria
                categorias={expenseByCat}
                currency={activeCurrency}
              />
            </div>

            <div className="lg:col-span-4">
              <CardPresupuesto presupuestos={presupuestos} />
            </div>
          </div>
        </main>

        <ModalNuevoMovimiento
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          onSave={asyncHandleSave}
          isSaving={createMovement.isPending}
        />
      </div>
    </div>
  );
}

export default Home;
