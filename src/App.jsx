import { Routes, Route, useNavigate } from "react-router-dom";
import MovimientosA from "./components/MovimientosA";
import Login from "./pages/Login";
import { useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import Home from "./features/dashboard/pages/Home";

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
        <Route path="/movimientos" element={<MovimientosA />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/presupuesto" element={<Home />} />
        <Route path="/cuentas" element={<Home />} />
      </Routes>
    </>
  );
}
