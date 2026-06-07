import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useToast } from "../components/ToastProvider";

export default function ResetPassword() {
  const navigate = useNavigate();
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setIsLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setIsLoading(false);
    if (err) {
      setError(
        err.message?.toLowerCase().includes("session")
          ? "El enlace expiró o es inválido. Solicitá uno nuevo desde el login."
          : err.message,
      );
      return;
    }
    toast.success("Contraseña actualizada");
    navigate("/home");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 grid-backdrop pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent pointer-events-none" />

      <div className="relative w-full max-w-[440px] animate-scale-in">
        <div className="card-glow-border bg-surface rounded-3xl shadow-modal overflow-hidden">
          <div className="px-8 pt-8 pb-2 text-center">
            <h1 className="font-display text-h1 text-primary mb-2">Nueva contraseña</h1>
            <p className="text-sm text-muted">Elegí una contraseña nueva para tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 space-y-4">
            <div>
              <label className="block text-eyebrow text-muted uppercase mb-2">Nueva contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-faint pointer-events-none group-focus-within:text-accent transition-colors duration-base" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  minLength={8}
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

            <div>
              <label className="block text-eyebrow text-muted uppercase mb-2">Confirmar contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-faint pointer-events-none group-focus-within:text-accent transition-colors duration-base" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="w-full bg-sunken border border-default rounded-md pl-10 pr-3.5 py-2.5 text-body text-primary placeholder:text-faint focus:outline-none focus:border-accent focus:shadow-focus transition-all duration-base"
                />
              </div>
            </div>

            {error && (
              <div role="alert" className="text-caption rounded-md px-3 py-2 border bg-danger/10 border-danger/30 text-danger animate-fade-in">
                {error}
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
                  Guardando…
                </>
              ) : (
                <>
                  Cambiar contraseña
                  <ArrowRight className="w-4 h-4 transition-transform duration-base group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-caption text-muted hover:text-primary transition-colors duration-base"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
