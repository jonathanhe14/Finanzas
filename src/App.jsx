// Importa un hook personalizado que encapsula la lógica de obtención de datos
// (probablemente desde Supabase), además del estado de carga/errores y filtros.
import { useRegistros } from "./hooks/useRegistros";

// Importa componentes de UI (presentacionales) separados por responsabilidad.
import Filters from "./components/Filters"; // UI para filtrar por categoría y fecha
import RegistrosTable from "./components/RegistrosTable"; // Tabla para listar los registros
import LoadingState from "./components/LoadingState"; // Pantalla/indicador cuando carga
import ErrorState from "./components/ErrorState"; // Pantalla cuando ocurre un error
import EmptyState from "./components/EmptyState"; // Pantalla cuando no hay resultados
import StatsBar from "./components/StatsBar"; // Barra con estadísticas/resumen
import { useState } from "react";
import { EditModal } from "./components/EditModal";

export default function App() {
  const {
    registros,
    allRegistros,
    loading,
    error,
    categorias,
    categoriaFilter,
    setCategoriaFilter,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    refetch,
    deleteRegistro,
    updateRegistro,
  } = useRegistros();

  // Determina si hay filtros activos.
  // `!!(...)` convierte el resultado a boolean explícito.
  // Se considera que hay filtros si existe categoría o fechaDesde o fechaHasta.
  const hasFilters = !!(categoriaFilter || fechaDesde || fechaHasta);
  const [isModalOpen, setIsModalOpen] = useState(false); //Esto me dice si se abre la modal o no
  const [registroActual, setRegistroActual] = useState(null);

  const handleEdit = (registro) => {
    setRegistroActual(registro);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };
  const handleSave = async (id, datosActualizados) => {
    const { error } = await updateRegistro(id, datosActualizados);
    if (!error) {
      handleClose();
    } else {
      alert("Error al actualizar registro: " + error.message);
    }
    
  };

  const handleDelete = (id) => {
    deleteRegistro(id);
  };

  // Render principal del componente
  return (
    // Contenedor general con clases Tailwind:
    // - min-h-screen: ocupa al menos el alto completo de la pantalla
    // - bg-gray-50: fondo gris claro
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        {/* Contenedor centrado con ancho máximo y padding responsive */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Layout flex: título a la izquierda, botón a la derecha */}
          <div className="flex items-center justify-between">
            <div>
              {/* Título principal */}
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Registros
              </h1>
              {/* Subtítulo */}
              <p className="mt-1 text-sm text-gray-500">
                Panel de consulta y filtrado de registros
              </p>
            </div>

            {/* Botón para forzar actualización de datos */}
            <button
              onClick={refetch} // al hacer click, dispara refetch()
              disabled={loading} // si está cargando, deshabilita el botón para evitar spam
              className="inline-flex items-center px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium
                         hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {/* Texto del botón cambia según loading */}
              {loading ? "Cargando..." : "Actualizar"}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {/* Render condicional:
            - Solo muestra StatsBar si:
              1) NO está cargando
              2) NO hay error
              3) Existen registros totales (allRegistros.length > 0)
         */}
        {!loading && !error && allRegistros.length > 0 && (
          // Se le pasan los registros "visibles" (posiblemente filtrados)
          <StatsBar registros={registros} />
        )}

        {/* Filters */}
        {/* Render condicional:
            - Solo muestra filtros si hay data disponible y no hay estados de carga/error.
            - Tiene sentido: si no hay data, mostrar filtros puede no aportar.
         */}
        {!loading && !error && allRegistros.length > 0 && (
          <Filters
            // Lista de categorías para poblar el selector
            categorias={categorias}
            // Estado actual del filtro de categoría + setter para actualizarlo desde Filters
            categoriaFilter={categoriaFilter}
            setCategoriaFilter={setCategoriaFilter}
            // Estado de fechas + setters (controlados desde el componente padre)
            fechaDesde={fechaDesde}
            setFechaDesde={setFechaDesde}
            fechaHasta={fechaHasta}
            setFechaHasta={setFechaHasta}
          />
        )}

        {/* Results count */}
        {/* Render condicional:
            - Muestra "Mostrando X de Y" solo cuando hay data total y no hay loading/error.
            - X = registros filtrados/visibles
            - Y = total de registros
         */}
        {!loading && !error && allRegistros.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Mostrando{" "}
              <span className="font-semibold text-gray-700">
                {registros.length}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-gray-700">
                {allRegistros.length}
              </span>{" "}
              registros
            </p>
          </div>
        )}

        {/* Content states */}
        {/* Aquí se decide qué componente mostrar según el estado de la app */}

        {/* Si loading es true, muestra el estado de carga */}
        {loading && <LoadingState />}

        {/* Si hay error, muestra pantalla de error con botón/acción de reintento */}
        {error && <ErrorState message={error} onRetry={refetch} />}

        {/* Si NO loading, NO error, y NO hay registros visibles:
            - Muestra EmptyState.
            - `hasFilters` permite que EmptyState sepa si está vacío por filtros (sin resultados)
              o si está vacío porque no hay data en general.
         */}
        {!loading && !error && registros.length === 0 && (
          <EmptyState hasFilters={hasFilters} />
        )}

        {/* Si NO loading, NO error, y hay registros, muestra la tabla */}
        {!loading && !error && registros.length > 0 && (
          <RegistrosTable
            registros={registros}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        <EditModal
          registro={registroActual}
          isOpen={isModalOpen}
          onClose={handleClose}
          onSave={handleSave}
        ></EditModal>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-xs text-gray-400">
            Registros App &mdash; React + Supabase + Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
