import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { Sidebar } from "../../../components/Sidebar";
import { CardFlujo } from "../components/CardFlujo";
import { CardBalance } from "../components/CardBalance";
import { CardUltimosMovimientos } from "../components/CardUltimosMovimientos";
import { CardGastosCategoria } from "../components/CardGastosCategoria";
import { CardPresupuesto } from "../components/CardPresupuesto";
import { CardProximoPago } from "../components/CardProximoPago";
import ModalNuevoMovimiento from "../components/ModalNuevoMovimiento";
import { useDashboardReport } from "../hooks/useDashboardReport";
import { useRecentEntries } from "../hooks/useRecentEntries";
import { useCreateMovement, useReconocerGanancia } from "../hooks/useCreateMovement";
import { useAccountsList } from "../../accounts/hooks/useAccountsList";
import { useMonthlyBudget, useExpenseSpent } from "../../budgets/hooks/useBudgets";
import { useScheduledEntries } from "../../budgets/hooks/useScheduled";
import { getMonthRange } from "../../../lib/utils/dates";
import { useToast } from "../../../components/ToastProvider";

const handleLogout = () => {
  supabase.auth.signOut();
};

function Home() {
  const [openModal, setOpenModal] = useState(false);
  const createMovement = useCreateMovement();
  const reconocer = useReconocerGanancia();
  const toast = useToast();

  // Rango fijo del mes en curso. El reporte y los presupuestos se calculan
  // sobre el mes actual; ya no hay navegación entre meses en el dashboard.
  const { from, to } = useMemo(() => {
    const now = new Date();
    return getMonthRange(now.getFullYear(), now.getMonth());
  }, []);

  // Rango del mes anterior, para las comparaciones de flujo (gastos/ingresos).
  const prev = useMemo(() => {
    const now = new Date();
    return getMonthRange(now.getFullYear(), now.getMonth() - 1);
  }, []);

  const { data: dashboardData } = useDashboardReport(from, to);
  const { data: prevDashboard } = useDashboardReport(prev.from, prev.to);
  const { data: recentEntries = [] } = useRecentEntries();
  const { data: accounts = [] } = useAccountsList();
  const { data: scheduled = [] } = useScheduledEntries();
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

  // Totales del mes anterior (misma moneda activa) y % de cambio.
  const pdata = useMemo(() => {
    const list = prevDashboard?.by_currency ?? [];
    return list.find((c) => c.currency_code === activeCurrency) ?? null;
  }, [prevDashboard, activeCurrency]);

  const pctChange = (curr, base) => {
    const c = Number(curr) || 0;
    const p = Number(base) || 0;
    if (p === 0) return 0; // sin base de comparación → la tarjeta muestra "—"
    return ((c - p) / p) * 100;
  };
  const expensePct = pctChange(cdata.expense_total, pdata?.expense_total);
  const incomePct = pctChange(cdata.income_total, pdata?.income_total);

  const expenseByCat = useMemo(
    () =>
      (dashboardData?.expense_by_category ?? []).filter(
        (c) => c.currency_code === activeCurrency,
      ),
    [dashboardData, activeCurrency],
  );

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
      if (movement.tipo === "reconocer") {
        // Reclasificación pasivo → ingreso (no mueve dinero entre cuentas).
        await reconocer.mutateAsync({
          amount: movement.monto,
          liability_account_id: movement.cuentaOrigenId,
          income_account_id: movement.cuentaDestinoId,
          description: movement.nombre,
        });
      } else {
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
      }
      setOpenModal(false);
      toast.success(
        movement.tipo === "reconocer" ? "Ganancia reconocida" : "Movimiento guardado",
      );
    } catch (e) {
      toast.error("Error al guardar el movimiento: " + (e.message || String(e)));
    }
  }

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
              nombre="Gastos"
              saldo={cdata.expense_total}
              porcentaje={expensePct}
              descripcion="vs mes pasado"
              currency={activeCurrency}
            />
            <CardFlujo
              trending="up"
              nombre="Ingresos"
              saldo={cdata.income_total}
              porcentaje={incomePct}
              descripcion="vs mes pasado"
              currency={activeCurrency}
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
            <div className="lg:col-span-8 lg:row-span-3 min-h-[420px]">
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

            <div className="lg:col-span-4">
              <CardProximoPago pagos={scheduled.slice(0, 3)} />
            </div>
          </div>
        </main>

        <ModalNuevoMovimiento
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          onSave={asyncHandleSave}
          isSaving={createMovement.isPending || reconocer.isPending}
        />
      </div>
    </div>
  );
}

export default Home;
