import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import { useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import Home from "./features/dashboard/pages/Home";
import Cuentas from "./features/accounts/pages/Cuentas";
import Movimientos from "./features/movements/pages/Movimientos";
import Presupuestos from "./features/budgets/pages/Presupuestos";

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        console.log("Usuario autenticado:", session.user.id);
        navigate("/home");
      }
    });
  }, []);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/movimientos" element={<Movimientos />} />
        <Route path="/presupuesto" element={<Presupuestos />} />
        <Route path="/cuentas" element={<Cuentas />} />
      </Routes>
    </>
  );
}
