// AuthForm.jsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const Login = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (activeTab == "login") {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
        
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
        });
        console.log("Se registro con exito");
      } catch (error) {
        console.log(error);
      }
    }
    setIsLoading(false);
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-30" />

        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10">
          {/* Header */}
          <div className="px-8 pt-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/25">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {activeTab === "login" ? "Bienvenido de vuelta" : "Crear cuenta"}
            </h1>
            <p className="text-slate-400 text-sm">
              {activeTab === "login"
                ? "Ingresa tus credenciales para continuar"
                : "Regístrate con tu correo y contraseña"}
            </p>
          </div>

          {/* Tabs */}
          <div className="px-8 pt-6">
            <div className="flex bg-slate-800/50 rounded-xl p-1 border border-white/5">
              <button
                onClick={() => switchTab("login")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 cursor-pointer ${
                  activeTab === "login"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => switchTab("register")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 cursor-pointer ${
                  activeTab === "register"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Registrarse
              </button>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Correo electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-12 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5 text-slate-500 hover:text-purple-400 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-slate-500 hover:text-purple-400 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Procesando...
                </div>
              ) : activeTab === "login" ? (
                "Ingresar"
              ) : (
                "Registrarse"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
