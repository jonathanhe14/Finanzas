import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useModalTransition } from "../lib/hooks/useModalTransition";
import { MENU } from "../lib/constants/navItems";

const MobileNavContext = createContext({
  isOpen: false,
  open: () => {},
  close: () => {},
});

/**
 * Navegación móvil (drawer + hamburguesa).
 *
 * El Sidebar lateral solo se muestra en `md+`; en móvil la navegación vive aquí:
 * un panel deslizante desde la izquierda que se abre con <MobileMenuButton />.
 * Se monta una sola vez (envolviendo las rutas en App.jsx) y queda inerte hasta
 * que alguna página llama `open()`. En /login y /reset no hay hamburguesa, así
 * que nunca se abre.
 */
export function MobileNavProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <MobileNavContext.Provider value={{ isOpen, open, close }}>
      {children}
      <MobileDrawer isOpen={isOpen} onClose={close} />
    </MobileNavContext.Provider>
  );
}

function MobileDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const visible = useModalTransition(isOpen);

  // Cerrar con Escape (mismo patrón que los modales).
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Bloquear el scroll del body mientras el drawer está abierto.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!visible) return null;

  const go = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    onClose();
    supabase.auth.signOut();
  };

  return (
    <div
      className={`md:hidden fixed inset-0 z-[120] transition-opacity duration-slow ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Panel deslizante */}
      <aside
        className={`absolute left-0 top-0 h-full w-[270px] max-w-[82vw] flex flex-col glass-panel border-r border-default shadow-modal pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] transition-transform duration-slow ease-standard ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-default flex-shrink-0">
          <div className="relative w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center flex-shrink-0 shadow-glow">
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
          </div>
          <span className="font-display font-semibold text-primary text-[15px] tracking-tight">
            Finanzas
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 pt-3 space-y-1 overflow-y-auto thin-scroll">
          {MENU.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.path)}
                className={`relative w-full h-11 flex items-center gap-3 px-3 rounded-lg transition-colors duration-base ease-standard ${
                  isActive
                    ? "bg-accent-soft text-primary"
                    : "text-secondary hover:bg-elevated hover:text-primary"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full ${
                    isActive
                      ? "bg-brand-gradient shadow-[0_0_12px_rgba(16,185,129,0.7)]"
                      : "opacity-0"
                  }`}
                />
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.25 : 1.85}
                  className={isActive ? "text-accent" : ""}
                />
                <span className="text-[14px] font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-default p-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full h-11 flex items-center gap-3 px-3 rounded-lg text-secondary hover:bg-elevated hover:text-danger transition-colors duration-base"
          >
            <LogOut size={18} strokeWidth={1.85} />
            <span className="text-[14px] font-medium">Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMobileNav() {
  return useContext(MobileNavContext);
}
