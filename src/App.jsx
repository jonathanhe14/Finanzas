import { Routes, Route,useNavigate } from "react-router-dom";
import MovimientosA from "./components/MovimientosA";
import Login from "./pages/login";
import { useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import Home from "./pages/Home";


export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if(!session) {
        navigate("/login");
      } else {
        navigate("/home");
      }
    });
  }, []);

  return (
    <Routes>
      <Route path="/movimientos" element={<MovimientosA />} />
      <Route path="/login" element={<Login/>} />
      <Route path="/home" element={<Home/>} />

    </Routes>
  );
}
