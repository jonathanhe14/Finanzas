import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ChevronRight, ChevronLeft } from "lucide-react";
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
import { getCurrentMonthRange } from "../../../lib/utils/dates";

const handleLogout = () => {
  supabase.auth.signOut();
};

const MES_ACTUAL = new Date().toLocaleDateString("es-CR", {
  month: "long",
  year: "numeric",
});

function Home() {
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();
  const createMovement = useCreateMovement();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) navigate("/login");
    });
  }, [navigate]);

  const { data: dashboardData } = useDashboardReport();
  const { data: recentEntries = [] } = useRecentEntries();
  const { data: accounts = [] } = useAccountsList();
  const { data: budget } = useMonthlyBudget();
  const monthRange = getCurrentMonthRange();
  const { data: spentMap = {} } = useExpenseSpent(monthRange.from, monthRange.to);

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
      });
      setOpenModal(false);
    } catch (e) {
      alert("Error al guardar el movimiento: " + (e.message || String(e)));
    }
  }

  const mesCapitalizado = MES_ACTUAL.charAt(0).toUpperCase() + MES_ACTUAL.slice(1);

  return (
    <div className="min-h-screen w-full text-primary">
      <Sidebar handleLogout={handleLogout} />

      <div className="ml-[64px] flex flex-col min-h-screen">
        <header className="relative h-16 glass-panel border-b border-default flex items-center justify-between px-6 sticky top-0 z-30">
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
            <div className="flex items-center bg-surface border border-default rounded-md p-0.5">
              <button
                type="button"
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
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted hover:bg-elevated hover:text-primary transition-colors duration-base"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-surface border border-default rounded-md px-3 py-1.5 w-44 focus-within:border-accent focus-within:shadow-focus transition-all duration-base">
              <Search className="w-3.5 h-3.5 text-faint" />
              <input
                type="text"
                placeholder="Buscar…"
                className="bg-transparent border-0 outline-none flex-1 text-[12px] text-primary placeholder:text-faint"
              />
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

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <CardFlujo
              trending="down"
              nombre="Gasto del mes"
              saldo={dashboardData?.expense_total ?? 0}
              porcentaje={0}
              descripcion="vs mes pasado"
            />
            <CardFlujo
              trending="up"
              nombre="Ingreso del mes"
              saldo={dashboardData?.income_total ?? 0}
              porcentaje={0}
              descripcion="vs mes pasado"
            />
            <CardBalance
              nombre="Balance disponible"
              saldo={dashboardData?.asset_balance ?? 0}
              tipo="ASSET"
              detalles="Disponible para gastar"
            />
            <CardBalance
              nombre="Deuda de tarjeta"
              saldo={dashboardData?.liability_balance ?? 0}
              tipo="LIABILITY"
              detalles="Próximo pago 15 de abril"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 lg:row-span-2 min-h-[420px]">
              <CardUltimosMovimientos movimientos={recentEntries} />
            </div>

            <div className="lg:col-span-4">
              <CardGastosCategoria
                categorias={dashboardData?.expense_by_category ?? []}
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
