import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  ArrowRight,
  Receipt,
  Calendar,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { Sidebar } from "../../../components/Sidebar";
import { MobileMenuButton } from "../../../components/MobileMenuButton";
import { supabase } from "../../../lib/supabaseClient";
import { formatMoney } from "../../../lib/utils/money";
import { getRollingRange } from "../../../lib/utils/dates";
import { toCsv, downloadCsv } from "../../../lib/utils/csv";
import { getMovementDetail, listMovementsByRange } from "../../../lib/services/movements.service";
import { useMovements, useUpdateMovement, useDeleteMovement } from "../hooks/useMovements";
import { useTags } from "../hooks/useTags";
import { useCreateMovement, useReconocerGanancia } from "../../dashboard/hooks/useCreateMovement";
import ModalNuevoMovimiento from "../../dashboard/components/ModalNuevoMovimiento";
import { useToast } from "../../../components/ToastProvider";

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

// Rangos de exportación CSV (días móviles terminados hoy).
const EXPORT_RANGES = [
  { id: 7, label: "Semana" },
  { id: 15, label: "Quincena" },
  { id: 30, label: "Mes" },
  { id: 90, label: "3 meses" },
];

const CSV_COLUMNS = [
  { header: "Fecha", value: (r) => r.entry_date },
  { header: "Tipo", value: (r) => r.tipo },
  { header: "Descripción", value: (r) => r.description ?? "" },
  { header: "Comercio", value: (r) => r.merchant_name ?? "" },
  { header: "Origen", value: (r) => r.origen_name ?? "" },
  { header: "Destino", value: (r) => r.destino_name ?? "" },
  { header: "Monto", value: (r) => r.amount },
  { header: "Moneda", value: (r) => r.currency_code ?? "" },
  { header: "Etiquetas", value: (r) => (r.tags ?? []).map((t) => t.name).join("; ") },
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
        {mov.origen_name && mov.destino_name && (
          <div className="flex items-center mt-1.5 min-w-0">
            <span className="inline-flex items-center gap-1.5 text-caption bg-elevated border border-default rounded-md px-2 py-0.5 max-w-full">
              <span className="truncate text-secondary">{mov.origen_name}</span>
              <ArrowRight className="w-3 h-3 flex-shrink-0 text-muted" strokeWidth={2.25} />
              <span className="truncate text-secondary">{mov.destino_name}</span>
            </span>
          </div>
        )}
        {mov.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {mov.tags.map((t) => (
              <span
                key={t.id}
                className="text-[10px] font-medium text-accent bg-accent/10 border border-accent/30 px-1.5 py-0.5 rounded-full"
              >
                #{t.name}
              </span>
            ))}
          </div>
        )}
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

      <div className="flex items-center gap-1 flex-shrink-0 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-base">
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
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [exportDays, setExportDays] = useState(30);
  const [exporting, setExporting] = useState(false);

  const { data: movimientos = [], isLoading, isError, error } = useMovements();
  const createMovement = useCreateMovement();
  const reconocer = useReconocerGanancia();
  const updateMovement = useUpdateMovement();
  const deleteMovement = useDeleteMovement();
  const { data: allTags = [] } = useTags();
  const toast = useToast();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return movimientos.filter((m) => {
      if (filter !== "todos" && m.tipo !== filter) return false;
      if (fechaDesde && m.entry_date < fechaDesde) return false;
      if (fechaHasta && m.entry_date > fechaHasta) return false;
      if (selectedTag && !(m.tags ?? []).some((t) => t.id === selectedTag)) return false;
      if (!term) return true;
      const haystack = `${m.merchant_name ?? ""} ${m.description ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [movimientos, filter, search, fechaDesde, fechaHasta, selectedTag]);

  // Paginación (cliente) sobre la lista filtrada.
  const PAGE_SIZE = 15;
  const [page, setPage] = useState(1);
  const filterSig = `${filter}|${search}|${fechaDesde}|${fechaHasta}|${selectedTag}`;
  const [prevSig, setPrevSig] = useState(filterSig);
  if (filterSig !== prevSig) {
    setPrevSig(filterSig);
    setPage(1);
  }
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function closeModal() {
    setOpenModal(false);
    setEditing(null);
  }

  async function asyncHandleSave(movement) {
    try {
      let successMsg;
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
          merchant_id: editing.merchant_id ?? null,
          tags: movement.tags,
        });
        successMsg = "Movimiento actualizado";
      } else if (movement.tipo === "reconocer") {
        // Reclasificación pasivo → ingreso (no mueve dinero entre cuentas).
        await reconocer.mutateAsync({
          amount: movement.monto,
          liability_account_id: movement.cuentaOrigenId,
          income_account_id: movement.cuentaDestinoId,
          description: movement.nombre,
        });
        successMsg = "Ganancia reconocida";
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
        successMsg = "Movimiento creado";
      }
      closeModal();
      toast.success(successMsg);
    } catch (e) {
      toast.error("Error al guardar el movimiento: " + (e.message || String(e)));
    }
  }

  async function handleEdit(mov) {
    try {
      const detail = await getMovementDetail(mov.id);
      setEditing({
        id: detail.id,
        entry_date: detail.entry_date,
        currency_code: detail.currency_code,
        merchant_id: detail.merchant_id ?? null,
        // forma que entiende el modal:
        nombre: detail.description ?? mov.merchant_name ?? "",
        monto: detail.amount,
        tipo: mov.tipo,
        cuentaDestinoId: detail.debit_account_id,
        cuentaOrigenId: detail.credit_account_id,
        tags: (mov.tags ?? []).map((t) => t.id),
      });
      setOpenModal(true);
    } catch (e) {
      toast.error("No se pudo cargar el movimiento: " + (e.message || String(e)));
    }
  }

  function handleDelete(mov) {
    const nombre = mov.merchant_name ?? mov.description ?? "este movimiento";
    if (!window.confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(mov.id);
    deleteMovement.mutate(mov.id, {
      onSuccess: () => toast.success("Movimiento eliminado"),
      onError: (e) => toast.error("Error al eliminar: " + (e?.message || String(e))),
      onSettled: () => setDeletingId(null),
    });
  }

  async function handleExport() {
    const { from, to } = getRollingRange(exportDays);
    setExporting(true);
    try {
      const rows = await listMovementsByRange(from, to);
      if (rows.length === 0) {
        toast.error("No hay movimientos en el rango seleccionado");
        return;
      }
      // `to` es exclusivo (mañana); el último día incluido es to − 1.
      const end = new Date(`${to}T00:00:00`);
      end.setDate(end.getDate() - 1);
      const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
      downloadCsv(`movimientos_${from}_a_${endStr}.csv`, toCsv(rows, CSV_COLUMNS));
      toast.success(`Exportados ${rows.length} movimiento${rows.length === 1 ? "" : "s"}`);
    } catch (e) {
      toast.error("Error al exportar: " + (e?.message || String(e)));
    } finally {
      setExporting(false);
    }
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
                Movimientos
                <span className="w-1 h-1 rounded-full bg-accent shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse-dot" />
              </h1>
              <p className="text-caption text-muted -mt-0.5">
                Historial detallado de tus movimientos
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-surface border border-default rounded-md px-3 py-1.5 flex-1 sm:flex-none sm:w-44 focus-within:border-accent focus-within:shadow-focus transition-all duration-base">
              <Search className="w-3.5 h-3.5 text-faint" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar…"
                className="bg-transparent border-0 outline-none flex-1 text-[12px] text-primary placeholder:text-faint"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <select
                value={exportDays}
                onChange={(e) => setExportDays(Number(e.target.value))}
                aria-label="Rango de exportación"
                className="bg-surface border border-default rounded-md px-2.5 py-2 text-[12px] text-primary outline-none focus:border-accent focus:shadow-focus transition-all duration-base [color-scheme:dark]"
              >
                {EXPORT_RANGES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-1.5 text-[12px] font-medium text-secondary bg-surface border border-default rounded-md px-3 py-2 hover:bg-elevated hover:text-primary transition-colors duration-base disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" strokeWidth={2.25} />
                {exporting ? "Exportando…" : "CSV"}
              </button>
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

        <main className="p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto flex-1 animate-fade-up">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex bg-surface p-1 rounded-xl border border-default">
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

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 text-[12px] text-muted">
                Desde
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="bg-surface border border-default rounded-md px-2.5 py-1.5 text-[12px] text-primary outline-none focus:border-accent focus:shadow-focus transition-all duration-base [color-scheme:dark]"
                />
              </label>
              <label className="flex items-center gap-1.5 text-[12px] text-muted">
                Hasta
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="bg-surface border border-default rounded-md px-2.5 py-1.5 text-[12px] text-primary outline-none focus:border-accent focus:shadow-focus transition-all duration-base [color-scheme:dark]"
                />
              </label>
              {(fechaDesde || fechaHasta) && (
                <button
                  type="button"
                  onClick={() => {
                    setFechaDesde("");
                    setFechaHasta("");
                  }}
                  className="text-[12px] font-medium text-muted hover:text-primary transition-colors duration-base px-2 py-1.5"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-5 -mt-2">
              <span className="text-[11px] text-faint mr-1">Etiquetas:</span>
              {allTags.map((t) => {
                const active = selectedTag === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTag(active ? null : t.id)}
                    className={`text-[11px] font-medium border px-2.5 py-1 rounded-full transition-colors duration-base ${
                      active
                        ? "bg-accent/15 text-accent border-accent/40"
                        : "text-muted border-default hover:text-primary hover:border-strong"
                    }`}
                  >
                    #{t.name}
                  </button>
                );
              })}
            </div>
          )}

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
                {search || filter !== "todos" || fechaDesde || fechaHasta || selectedTag
                  ? "No hay movimientos que coincidan"
                  : "Aún no hay movimientos"}
              </p>
              <p className="text-caption text-muted mt-1">
                {search || filter !== "todos" || fechaDesde || fechaHasta || selectedTag
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
                {totalPages > 1 && (
                  <span className="text-caption text-muted">
                    Página {safePage} de {totalPages}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {pageItems.map((mov, i) => (
                  <MovimientoCard
                    key={mov.id ?? i}
                    mov={mov}
                    busy={deletingId === mov.id}
                    onEdit={() => handleEdit(mov)}
                    onDelete={() => handleDelete(mov)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-5">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="flex items-center gap-1 text-[12px] font-medium text-secondary bg-surface border border-default rounded-md px-3 py-1.5 hover:bg-elevated hover:text-primary transition-colors duration-base disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Anterior
                  </button>
                  <span className="num-chip text-[12px] text-muted px-2">
                    {safePage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    className="flex items-center gap-1 text-[12px] font-medium text-secondary bg-surface border border-default rounded-md px-3 py-1.5 hover:bg-elevated hover:text-primary transition-colors duration-base disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Siguiente
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        <ModalNuevoMovimiento
          isOpen={openModal}
          onClose={closeModal}
          onSave={asyncHandleSave}
          isSaving={createMovement.isPending || updateMovement.isPending || reconocer.isPending}
          initial={editing}
        />
      </div>
    </div>
  );
}
