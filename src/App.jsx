import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import { useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import Home from "./features/dashboard/pages/Home";
import Cuentas from "./features/accounts/pages/Cuentas";
import Movimientos from "./features/movements/pages/Movimientos";
import Presupuestos from "./features/budgets/pages/Presupuestos";
import Reportes from "./features/reports/pages/Reportes";
import Metas from "./features/goals/pages/Metas";

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const path = window.location.pathname;
      if (!session) {
        // Sesión cerrada o inexistente → al login (excepto en /reset, que
        // procesa el token de recuperación de contraseña).
        if (path !== "/reset") navigate("/login");
        return;
      }
      // Con sesión: sólo redirigimos a /home cuando el usuario está en la
      // pantalla de login o en la raíz. Así un refresh o un deep-link a
      // /movimientos, /cuentas, etc. conserva la ruta actual.
      if (path === "/login" || path === "/") navigate("/home");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/movimientos" element={<Movimientos />} />
        <Route path="/presupuesto" element={<Presupuestos />} />
        <Route path="/cuentas" element={<Cuentas />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/metas" element={<Metas />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  );
}
