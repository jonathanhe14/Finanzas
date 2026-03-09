import React, { useEffect } from "react";
import Card from "../components/Card";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if(!supabase.auth.getUser()){
        console.log("No hay usuario autenticado");
        navigate("/login");
    }
    console.log("Usuario autenticado:", supabase.auth.getUser());
  }, [navigate]);

  const handleLogout = () => {
    console.log("Usuario ha cerrado sesión");
    supabase.auth.signOut();
  };

  return (
    <>
      <header className="relative w-full">
        {/* Borde inferior con gradiente */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

        <div className="relative z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">
                Nova<span className="text-purple-400">Pay</span>
              </span>
            </div>

            {/* Nav central (desktop) */}
            <nav className="hidden md:flex items-center gap-1">
              {["Inicio", "Transacciones", "Cuentas"].map((item, i) => (
                <button
                  key={item}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
                    i === 0
                      ? "text-white bg-white/5 border border-white/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>

            {/* Lado derecho */}
            <div className="flex items-center gap-3">
              {/* Notificaciones */}
              <button className="relative w-10 h-10 rounded-xl bg-slate-800/50 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all duration-300 cursor-pointer">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {/* Punto de notificación */}
                <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50" />
              </button>

              {/* Botón cerrar sesión (desktop) */}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 text-purple-400 hover:from-red-600/20 hover:to-blue-600/20 hover:text-purple-300 hover:border-purple-500/40 transition-all duration-300 cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="text-sm font-medium">Cerrar sesión</span>
              </button>

              {/* Menú hamburguesa (mobile) */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden w-10 h-10 rounded-xl bg-slate-800/50 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 cursor-pointer"
              >
                {menuOpen ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Menú mobile */}
          {menuOpen && (
            <div className="md:hidden border-t border-white/5 px-6 py-4 space-y-2">
              {["Inicio", "Transacciones", "Cuentas"].map((item, i) => (
                <button
                  key={item}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
                    i === 0
                      ? "text-white bg-white/5 border border-white/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item}
                </button>
              ))}

              <div className="h-px bg-white/5 my-2" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-300 cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="text-sm font-medium">Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </header>
      <Card nombre="Saldo" monto={2000} cuenta="Wink" />
    </>
  );
}

export default Home;
