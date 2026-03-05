import { useState, useEffect } from "react";
import {
  X,
  Save,
  DollarSign,
  Tag,
  CreditCard,
  Calendar,
  User,
  NotebookTabs,
} from "lucide-react"; // Esta es una libreria de iconos en react
import { InputField } from "./InputField";
import { SelectField } from "./SelectField";
import ErrorState from "./ErrorState";


//Establecemos las categorias que vamos a utilizar
const categorias = [
  { value: "alimentacion", label: "🛒 Alimentación" },
  { value: "transporte", label: "🚗 Transporte" },
  { value: "entretenimiento", label: "🎬 Entretenimiento" },
  { value: "salud", label: "💊 Salud" },
  { value: "educacion", label: "📚 Educación" },
  { value: "ropa", label: "👕 Ropa" },
  { value: "hogar", label: "🏠 Hogar" },
  { value: "otros", label: "📦 Otros" },
  { value: "gastos_fijos", label: "💲 Gastos Fijos" },
];

//Establecemos los metodos que vamos a utilizar
const metodos = [
  { value: "efectivo", label: "💵 Efectivo" },
  { value: "tarjeta_wink", label: "💳 Tarjeta Wink" },
  { value: "tarjeta_credito", label: "💳 Tarjeta de Crédito" },
  { value: "bac", label: "💳 Tajeta BAC" },
];

export const EditModal = ({ registro, isOpen, onClose, onSave }) => {


  const [formData, setFormData] = useState({
    nombre: "",
    monto: "",
    categoria: "",
    metodo: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Cargar datos del registro al abrir el modal
  useEffect(() => {
    if (registro && isOpen) {
      setFormData({
        nombre: registro.nombre || "",
        monto: registro.monto || "",
        categoria: registro.categoria || "",
        metodo: registro.metodo || "",
      });
      setErrors({});
      setShowSuccess(false);
    }
  }, [registro, isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!formData.monto) newErrors.monto = "El monto es obligatorio";
    else if (isNaN(formData.monto) || Number(formData.monto) <= 0)
      newErrors.monto = "Ingresa un monto válido mayor a 0";
    if (!formData.categoria) newErrors.categoria = "Selecciona una categoría";
    if (!formData.metodo) newErrors.metodo = "Selecciona un método de pago";
    if (!formData.fecha) newErrors.fecha = "La fecha es obligatoria";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    console.log("Hola")
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      onSave(registro.id,formData)
      return;
    }
    TODO: //Ver para que sirven estas lineas de abajo
    setIsLoading(true);
    // Simular llamada a API

    setIsLoading(false);
    setShowSuccess(true);
      
   };

    if (!isOpen) return null;



  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Fondo oscuro */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Ventana del modal */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden
        animate-in zoom-in-95 fade-in duration-200"
      >
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Editar Registro</h2>
              <p className="text-indigo-200 text-sm mt-0.5">
                ID #{registro?.id} · Modifica los campos necesarios
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/20
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Formulario ── */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Nombre */}
          <InputField
            label="Nombre / Descripción"
            icon={User}
            type="text"
            name="nombre"
            placeholder="Ej: Compra supermercado"
            value={formData.nombre}
            onChange={handleChange}
            error={errors.nombre}
          />

          {/* Monto */}
          <InputField
            label="Monto ($)"
            icon={DollarSign}
            type="number"
            name="monto"
            placeholder="0.00"
            step="0.01"
            min="0"
            value={formData.monto}
            onChange={handleChange}
            error={errors.monto}
          />

          {/* Fila: Categoría + Método */}
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Categoría"
              icon={Tag}
              name="categoria"
              options={categorias}
              value={formData.categoria}
              onChange={handleChange}
              error={errors.categoria}
            />
            <SelectField
              label="Método de Pago"
              icon={CreditCard}
              name="metodo"
              options={metodos}
              value={formData.metodo}
              onChange={handleChange}
              error={errors.metodo}
            />
          </div>

          <InputField
            label="Descripcion"
            icon={NotebookTabs}
            type="text"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            error={errors.descripcion}
          />

          {/* ── Mensaje de éxito ── */}
          {showSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-600 text-lg">✅</span>
              <p className="text-sm text-green-700 font-medium">
                ¡Registro actualizado correctamente!
              </p>
            </div>
          )}

          {/* ── Botones ── */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium
                hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || showSuccess}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium
                hover:from-indigo-700 hover:to-purple-700 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
