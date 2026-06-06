import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Home from "./features/dashboard/pages/Home";
import Cuentas from "./features/accounts/pages/Cuentas";
import Movimientos from "./features/movements/pages/Movimientos";
import Presupuestos from "./features/budgets/pages/Presupuestos";
import Reportes from "./features/reports/pages/Reportes";
import Metas from "./features/goals/pages/Metas";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { session, loading } = useAuth();

  // Mientras se resuelve la sesión inicial evitamos parpadear hacia /login
  // en un refresh o deep-link de un usuario ya autenticado.
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Públicas. Un usuario autenticado en /login va directo a /home. */}
      <Route
        path="/login"
        element={session ? <Navigate to="/home" replace /> : <Login />}
      />
      {/* /reset usa la sesión temporal de recuperación, siempre accesible. */}
      <Route path="/reset" element={<ResetPassword />} />

      {/* Privadas: protegidas por <ProtectedRoute>. */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movimientos"
        element={
          <ProtectedRoute>
            <Movimientos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/presupuesto"
        element={
          <ProtectedRoute>
            <Presupuestos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cuentas"
        element={
          <ProtectedRoute>
            <Cuentas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reportes"
        element={
          <ProtectedRoute>
            <Reportes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/metas"
        element={
          <ProtectedRoute>
            <Metas />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to={session ? "/home" : "/login"} replace />}
      />
    </Routes>
  );
}
