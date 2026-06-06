import { useState, useMemo } from "react";
import {
  Plus,
  Wallet,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  Archive,
} from "lucide-react";
import { Sidebar } from "../../../components/Sidebar";
import { supabase } from "../../../lib/supabaseClient";
import { formatMoney } from "../../../lib/utils/money";
import {
  useAccountsList,
  useAccountBalances,
  useDeleteOrArchiveAccount,
  useCurrencies,
} from "../hooks/useAccountsList";
import ModalNuevaCuenta from "../components/ModalNuevaCuenta";
import { useToast } from "../../../components/ToastProvider";

const TYPE_META = {
  ASSET: {
    label: "Activo",
    Icon: Wallet,
    iconBg: "bg-success/10",
    iconColor: "text-success",
    chip: "bg-success/10 text-success border-success/30",
  },
  LIABILITY: {
    label: "Pasivo",
    Icon: CreditCard,
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    chip: "bg-warning/10 text-warning border-warning/30",
  },
  EXPENSE: {
    label: "Gasto",
    Icon: ArrowDownCircle,
    iconBg: "bg-danger/10",
    iconColor: "text-danger",
    chip: "bg-danger/10 text-danger border-danger/30",
  },
  INCOME: {
    label: "Ingreso",
    Icon: ArrowUpCircle,
    iconBg: "bg-info/10",
    iconColor: "text-info",
    chip: "bg-info/10 text-info border-info/30",
  },
};

const handleLogout = () => {
  supabase.auth.signOut();
};

function AccountRow({ account, balance, onRemove }) {
  const meta = TYPE_META[account.type] ?? TYPE_META.ASSET;
  const Icon = meta.Icon;
  const showBalance = account.type === "ASSET" || account.type === "LIABILITY";
  // Saldo actual (saldo inicial + movimientos, con el signo normal por tipo).
  // Si aún no cargan los saldos, caemos al saldo inicial para no mostrar 0.
  const saldo = balance ?? account.opening_balance ?? 0;

  return (
    <div className="group flex items-center gap-4 px-5 py-4 bg-surface border border-default rounded-2xl hover:bg-elevated hover:shadow-card-hover transition-all duration-base ease-standard">
      <div
        className={`w-10 h-10 rounded-xl ${meta.iconBg} flex items-center justify-center flex-shrink-0 ring-1 ring-inset ring-white/5`}
      >
        <Icon className={`w-5 h-5 ${meta.iconColor}`} strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-body font-semibold text-primary truncate">{account.name}</span>
          <span
            className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full uppercase tracking-wider ${meta.chip}`}
          >
            {meta.label}
          </span>
        </div>
        <div className="text-caption text-muted mt-0.5">{account.currency_code}</div>
      </div>

      {showBalance && (
        <div className="text-right">
          <div className="amount text-num-md text-primary">
            {formatMoney(saldo, account.currency_code)}
          </div>
          <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5">
            Saldo actual
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => onRemove(account.id)}
        className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-base w-9 h-9 rounded-lg hover:bg-danger/10 flex items-center justify-center text-muted hover:text-danger"
        title="Eliminar"
        aria-label="Eliminar cuenta"
      >
        <Archive className="w-4 h-4" />
      </button>
    </div>
  );
}

function Section({ title, description, items, balances = {}, onRemove, emptyHint }) {
  if (items.length === 0) {
    return (
      <div className="bg-elevated border border-dashed border-default rounded-2xl px-6 py-10 text-center">
        <div className="text-h3 text-primary mb-1">{title}</div>
        <div className="text-sm text-muted">{emptyHint}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-3 px-1">
        <div>
          <h3 className="text-h3 text-primary">{title}</h3>
          <p className="text-caption text-muted">{description}</p>
        </div>
        <span className="amount text-caption text-muted">{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.map((acc) => (
          <AccountRow
            key={acc.id}
            account={acc}
            balance={balances[acc.id]}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

export default function Cuentas() {
  const [tab, setTab] = useState("cuenta");
  const [openModal, setOpenModal] = useState(false);

  const { data: accounts = [], isLoading, isError, error } = useAccountsList();
  const { data: balances = {} } = useAccountBalances();
  useCurrencies();
  const removeMutation = useDeleteOrArchiveAccount();
  const toast = useToast();

  const grouped = useMemo(() => {
    const g = { ASSET: [], LIABILITY: [], EXPENSE: [], INCOME: [] };
    for (const acc of accounts) {
      if (g[acc.type]) g[acc.type].push(acc);
    }
    return g;
  }, [accounts]);

  function handleRemove(id) {
    if (
      !confirm(
        "¿Eliminar esta cuenta? Si no tiene movimientos se borrará de forma permanente; si tiene historial, se archivará.",
      )
    )
      return;
    removeMutation.mutate(id, {
      onSuccess: (result) =>
        toast.success(
          result === "deleted"
            ? "Cuenta eliminada"
            : "La cuenta tiene historial: se archivó en lugar de eliminarse",
        ),
      onError: (e) => toast.error("Error al eliminar: " + (e?.message || String(e))),
    });
  }

  const isCuentas = tab === "cuenta";
  const newButtonLabel = isCuentas ? "Nueva cuenta" : "Nueva categoría";

  return (
    <div className="min-h-screen w-full text-primary">
      <Sidebar handleLogout={handleLogout} />

      <div className="ml-[64px] flex flex-col min-h-screen">
        <header className="min-h-16 glass-panel border-b border-default flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-2.5 sm:py-0 sm:h-16 sticky top-0 z-30">
          <div>
            <h1 className="font-display text-h2 text-primary">Cuentas y categorías</h1>
            <p className="text-caption text-muted -mt-0.5">
              Organiza tus cuentas y categoriza tus movimientos
            </p>
          </div>
          <button
            onClick={() => setOpenModal(true)}
            type="button"
            className="group bg-brand-gradient text-white text-[12px] font-semibold rounded-md px-3.5 py-2 flex items-center gap-1.5 hover:shadow-glow active:scale-[0.97] transition-all duration-base ease-standard"
          >
            <Plus
              className="w-3.5 h-3.5 transition-transform duration-base group-hover:rotate-90"
              strokeWidth={2.5}
            />
            {newButtonLabel}
          </button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto flex-1 animate-fade-up">
          <div className="inline-flex bg-surface p-1 rounded-xl mb-6 border border-default">
            {[
              { id: "cuenta", label: "Cuentas" },
              { id: "categoria", label: "Categorías" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-4 py-1.5 text-[12px] font-semibold rounded-lg transition-all duration-base ease-standard ${
                  tab === t.id
                    ? "bg-elevated text-primary shadow-sm"
                    : "text-muted hover:text-primary"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="space-y-2">
              <div className="skeleton h-[68px]" />
              <div className="skeleton h-[68px]" />
              <div className="skeleton h-[68px]" />
            </div>
          )}

          {isError && (
            <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-xl px-4 py-3">
              Error al cargar: {error?.message}
            </div>
          )}

          {!isLoading && !isError && isCuentas && (
            <div className="space-y-6">
              <Section
                title="Activos"
                description="Efectivo, cuentas bancarias, ahorros"
                items={grouped.ASSET}
                balances={balances}
                onRemove={handleRemove}
                emptyHint="Aún no tienes cuentas de activo. Crea una para empezar."
              />
              <Section
                title="Pasivos"
                description="Tarjetas de crédito, préstamos"
                items={grouped.LIABILITY}
                balances={balances}
                onRemove={handleRemove}
                emptyHint="Sin pasivos registrados."
              />
            </div>
          )}

          {!isLoading && !isError && !isCuentas && (
            <div className="space-y-6">
              <Section
                title="Categorías de gasto"
                description="A dónde va tu dinero"
                items={grouped.EXPENSE}
                onRemove={handleRemove}
                emptyHint="Aún no tienes categorías de gasto."
              />
              <Section
                title="Categorías de ingreso"
                description="De dónde viene tu dinero"
                items={grouped.INCOME}
                onRemove={handleRemove}
                emptyHint="Aún no tienes categorías de ingreso."
              />
            </div>
          )}
        </main>

        <ModalNuevaCuenta
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          mode={tab}
        />
      </div>
    </div>
  );
}
