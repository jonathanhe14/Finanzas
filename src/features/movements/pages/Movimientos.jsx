import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  Receipt,
  Calendar,
  Pencil,
  Trash2,
} from "lucide-react";
import { Sidebar } from "../../../components/Sidebar";
import { supabase } from "../../../lib/supabaseClient";
import { formatMoney } from "../../../lib/utils/money";
import { getMovementDetail } from "../../../lib/services/movements.service";
import { useMovements, useUpdateMovement, useDeleteMovement } from "../hooks/useMovements";
import { useCreateMovement } from "../../dashboard/hooks/useCreateMovement";
import ModalNuevoMovimiento from "../../dashboard/components/ModalNuevoMovimiento";

const TIPO_CONFIG = {
  gasto: {
    label: "Gasto",
    color: "text-danger",
    bg: "bg-danger/10",
    chip: "bg-danger/10 text-danger border-danger/30",
    Icon: TrendingDown,
    prefix: "−",
  },
  ingreso: {
    label: "Ingreso",
    color: "text-success",
    bg: "bg-success/10",
    chip: "bg-success/10 text-success border-success/30",
    Icon: TrendingUp,
    prefix: "+",
  },
  transferencia: {
    label: "Transferencia",
    color: "text-info",
    bg: "bg-info/10",
    chip: "bg-info/10 text-info border-info/30",
    Icon: ArrowLeftRight,
    prefix: "",
  },
};

const FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "ingreso", label: "Ingresos" },
  { id: "gasto", label: "Gastos" },
  { id: "transferencia", label: "Transferencias" },
];

const handleLogout = () => {
  supabase.auth.signOut();
};

function formatFecha(dateStr) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function MovimientoCard({ mov, onEdit, onDelete, busy }) {
  const config = TIPO_CONFIG[mov.tipo] ?? TIPO_CONFIG.gasto;
  const { Icon, color, bg, chip, prefix, label } = config;
  const titulo = mov.merchant_name ?? mov.description ?? "Movimiento";

  return (
    <div className="group flex items-center gap-4 px-5 py-4 bg-surface border border-default rounded-2xl hover:bg-elevated hover:shadow-card-hover transition-all duration-base ease-standard">
      <div
        className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 ring-1 ring-inset ring-white/5`}
      >
        <Icon className={`w-5 h-5 ${color}`} strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-body font-semibold text-primary truncate">
            {titulo}
          </span>
          <span
            className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap ${chip}`}
          >
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-caption text-muted mt-0.5">
          <Calendar className="w-3 h-3" strokeWidth={2} />
          <span className="capitalize">{formatFecha(mov.entry_date)}</span>
          {mov.description && mov.merchant_name && (
            <span className="truncate before:content-['·'] before:mx-1.5">
              {mov.description}
            </span>
          )}
        </div>
      </div>

      <div className="text-right">
        <div className={`amount text-num-md ${color}`}>
          {prefix}
          {formatMoney(mov.amount, mov.currency_code ?? "CRC")}
        </div>
        <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5">
          {mov.currency_code ?? "CRC"}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-base">
        <button
          type="button"
          onClick={onEdit}
          disabled={busy}
          className="w-8 h-8 rounded-md flex items-center justify-center text-muted hover:bg-surface hover:text-primary transition-colors duration-base disabled:opacity-50"
          aria-label="Editar movimiento"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="w-8 h-8 rounded-md flex items-center justify-center text-muted hover:bg-danger/10 hover:text-danger transition-colors duration-base disabled:opacity-50"
          aria-label="Eliminar movimiento"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function Movimientos() {
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { data: movimientos = [], isLoading, isError, error } = useMovements();
  const createMovement = useCreateMovement();
  const updateMovement = useUpdateMovement();
  const deleteMovement = useDeleteMovement();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return movimientos.filter((m) => {
      if (filter !== "todos" && m.tipo !== filter) return false;
      if (!term) return true;
      const haystack = `${m.merchant_name ?? ""} ${m.description ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [movimientos, filter, search]);

  function closeModal() {
    setOpenModal(false);
    setEditing(null);
  }

  async function asyncHandleSave(movement) {
    try {
      if (editing) {
        await updateMovement.mutateAsync({
          id: editing.id,
          entry_date: editing.entry_date,
          description: movement.nombre,
          amount: movement.monto,
          currency_code: editing.currency_code ?? "CRC",
          debit_account_id: movement.cuentaDestinoId,
          credit_account_id: movement.cuentaOrigenId,
          memo: movement.nombre,
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
        });
      }
      closeModal();
    } catch (e) {
      alert("Error al guardar el movimiento: " + (e.message || String(e)));
    }
  }

  async function handleEdit(mov) {
    try {
      const detail = await getMovementDetail(mov.id);
      setEditing({
        id: detail.id,
        entry_date: detail.entry_date,
        currency_code: detail.currency_code,
        // forma que entiende el modal:
        nombre: detail.description ?? mov.merchant_name ?? "",
        monto: detail.amount,
        tipo: mov.tipo,
        cuentaDestinoId: detail.debit_account_id,
        cuentaOrigenId: detail.credit_account_id,
      });
      setOpenModal(true);
    } catch (e) {
      alert("No se pudo cargar el movimiento: " + (e.message || String(e)));
    }
  }

  function handleDelete(mov) {
    const nombre = mov.merchant_name ?? mov.description ?? "este movimiento";
    if (!window.confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(mov.id);
    deleteMovement.mutate(mov.id, {
      onError: (e) => alert("Error al eliminar: " + (e?.message || String(e))),
      onSettled: () => setDeletingId(null),
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
              Movimientos
              <span className="w-1 h-1 rounded-full bg-accent shadow-[0_0_6px_rgba(6,182,212,0.8)] animate-pulse-dot" />
            </h1>
            <p className="text-caption text-muted -mt-0.5">
              Historial detallado de tus movimientos
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center gap-2 bg-surface border border-default rounded-md px-3 py-1.5 w-44 focus-within:border-accent focus-within:shadow-focus transition-all duration-base">
              <Search className="w-3.5 h-3.5 text-faint" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar…"
                className="bg-transparent border-0 outline-none flex-1 text-[12px] text-primary placeholder:text-faint"
              />
            </div>

            <button
              onClick={() => {
                setEditing(null);
                setOpenModal(true);
              }}
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

        <main className="p-6 lg:p-8 max-w-4xl w-full mx-auto flex-1 animate-fade-up">
          <div className="inline-flex bg-surface p-1 rounded-xl mb-6 border border-default">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`px-4 py-1.5 text-[12px] font-semibold rounded-lg transition-all duration-base ease-standard ${
                  filter === f.id
                    ? "bg-elevated text-primary shadow-sm"
                    : "text-muted hover:text-primary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="space-y-2">
              <div className="skeleton h-[76px]" />
              <div className="skeleton h-[76px]" />
              <div className="skeleton h-[76px]" />
              <div className="skeleton h-[76px]" />
            </div>
          )}

          {isError && (
            <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-xl px-4 py-3">
              Error al cargar: {error?.message}
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="bg-elevated border border-dashed border-default rounded-2xl px-6 py-12 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center mb-3 ring-1 ring-inset ring-white/5">
                <Receipt className="w-5 h-5 text-muted" strokeWidth={1.75} />
              </div>
              <p className="text-sm text-primary font-medium">
                {search || filter !== "todos"
                  ? "No hay movimientos que coincidan"
                  : "Aún no hay movimientos"}
              </p>
              <p className="text-caption text-muted mt-1">
                {search || filter !== "todos"
                  ? "Prueba con otro filtro o término de búsqueda"
                  : "Registra tu primer ingreso o gasto"}
              </p>
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-caption text-muted">
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "movimiento" : "movimientos"}
                </span>
              </div>
              <div className="space-y-2">
                {filtered.map((mov, i) => (
                  <MovimientoCard
                    key={mov.id ?? i}
                    mov={mov}
                    busy={deletingId === mov.id}
                    onEdit={() => handleEdit(mov)}
                    onDelete={() => handleDelete(mov)}
                  />
                ))}
              </div>
            </>
          )}
        </main>

        <ModalNuevoMovimiento
          isOpen={openModal}
          onClose={closeModal}
          onSave={asyncHandleSave}
          isSaving={createMovement.isPending || updateMovement.isPending}
          initial={editing}
        />
      </div>
    </div>
  );
}
