import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * Envuelve rutas privadas. Bloquea el render del contenido protegido hasta
 * conocer el estado de la sesión y redirige a /login si no hay sesión activa,
 * preservando la ruta de origen en `state.from` para volver tras autenticarse.
 */
export function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
