import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const Login = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setFeedback(null);
  };

  const handleForgot = async () => {
    if (!email) {
      setFeedback({ type: "error", message: "Ingresá tu correo para enviarte el enlace." });
      return;
    }
    setIsLoading(true);
    setFeedback(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset",
    });
    setIsLoading(false);
    if (error) setFeedback({ type: "error", message: traducirError(error.message) });
    else
      setFeedback({
        type: "success",
        message: "Te enviamos un correo para restablecer tu contraseña.",
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    try {
      if (activeTab === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setFeedback({ type: "error", message: traducirError(error.message) });
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setFeedback({ type: "error", message: traducirError(error.message) });
        } else if (data?.user && !data.session) {
          setFeedback({
            type: "success",
            message: "Te enviamos un correo para confirmar tu cuenta.",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Animated glow orbs */}
      <div
        className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-accent opacity-[0.18] blur-3xl pointer-events-none animate-orb-float"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-[560px] h-[560px] rounded-full bg-brand2 opacity-[0.15] blur-3xl pointer-events-none animate-orb-float"
        style={{ animationDelay: "-4s" }}
      />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full bg-accent opacity-[0.08] blur-3xl pointer-events-none animate-orb-float"
        style={{ animationDelay: "-8s" }}
      />

      {/* Grid backdrop */}
      <div className="absolute inset-0 grid-backdrop pointer-events-none" />

      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent pointer-events-none" />

      <div className="relative w-full max-w-[440px] animate-scale-in">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="relative w-9 h-9 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow-lg">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-white relative z-10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 7H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span aria-hidden className="absolute inset-0 rounded-lg animate-pulse-glow pointer-events-none" />
          </div>
          <span className="font-display font-semibold text-primary text-lg tracking-tight">
            Finanzas
          </span>
        </div>

        {/* Card with always-on gradient border */}
        <div className="card-glow-border bg-surface rounded-3xl shadow-modal overflow-hidden">
          <div className="px-8 pt-8 pb-2 text-center">
            <h1 className="font-display text-h1 text-primary mb-2">
              {activeTab === "login" ? "Bienvenido de vuelta" : "Crear cuenta"}
            </h1>
            <p className="text-sm text-muted">
              {activeTab === "login"
                ? "Ingresa tus credenciales para continuar"
                : "Regístrate con tu correo y contraseña"}
            </p>
          </div>

          {/* Tabs */}
          <div className="px-8 pt-6">
            <div className="flex bg-sunken rounded-xl p-1 border border-default">
              {[
                { id: "login", label: "Iniciar sesión" },
                { id: "register", label: "Registrarse" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchTab(tab.id)}
                  className={`relative flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all duration-base ease-standard ${
                    activeTab === tab.id
                      ? "bg-elevated text-primary shadow-sm"
                      : "text-muted hover:text-secondary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pt-5 pb-8 space-y-4">
            <div>
              <label className="block text-eyebrow text-muted uppercase mb-2">
                Correo electrónico
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-faint pointer-events-none group-focus-within:text-accent transition-colors duration-base" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  required
                  className="w-full bg-sunken border border-default rounded-md pl-10 pr-3.5 py-2.5 text-body text-primary placeholder:text-faint focus:outline-none focus:border-accent focus:shadow-focus transition-all duration-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-eyebrow text-muted uppercase mb-2">
                Contraseña
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-faint pointer-events-none group-focus-within:text-accent transition-colors duration-base" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={activeTab === "login" ? "current-password" : "new-password"}
                  required
                  minLength={6}
                  className="w-full bg-sunken border border-default rounded-md pl-10 pr-10 py-2.5 text-body text-primary placeholder:text-faint focus:outline-none focus:border-accent focus:shadow-focus transition-all duration-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md hover:bg-elevated text-faint hover:text-secondary transition-colors duration-base"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {activeTab === "login" && (
              <div className="-mt-1 text-right">
                <button
                  type="button"
                  onClick={handleForgot}
                  className="text-caption text-muted hover:text-accent transition-colors duration-base"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            {feedback && (
              <div
                role="alert"
                className={`text-caption rounded-md px-3 py-2 border animate-fade-in ${
                  feedback.type === "error"
                    ? "bg-danger/10 border-danger/30 text-danger"
                    : "bg-success/10 border-success/30 text-success"
                }`}
              >
                {feedback.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full py-3 bg-brand-gradient text-white rounded-md text-[14px] font-semibold transition-all duration-base ease-standard hover:shadow-glow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando…
                </>
              ) : (
                <>
                  {activeTab === "login" ? "Ingresar" : "Crear cuenta"}
                  <ArrowRight className="w-4 h-4 transition-transform duration-base group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => switchTab(activeTab === "login" ? "register" : "login")}
                className="text-caption text-muted hover:text-primary transition-colors duration-base"
              >
                {activeTab === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                <span className="text-accent font-semibold">
                  {activeTab === "login" ? "Crea una" : "Inicia sesión"}
                </span>
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-[11px] text-faint mt-6">
          Diseñado para llevar el control de tu dinero.
        </p>
      </div>
    </div>
  );
};

function traducirError(msg) {
  if (!msg) return "Algo salió mal. Intenta de nuevo.";
  const lower = msg.toLowerCase();
  if (lower.includes("invalid login")) return "Correo o contraseña incorrectos.";
  if (lower.includes("email not confirmed"))
    return "Tu correo aún no está confirmado. Revisa tu bandeja.";
  if (lower.includes("user already registered"))
    return "Ya existe una cuenta con ese correo.";
  if (lower.includes("password should be"))
    return "La contraseña debe tener al menos 6 caracteres.";
  return msg;
}

export default Login;
