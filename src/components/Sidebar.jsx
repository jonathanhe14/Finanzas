import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowRightLeft,
  ChartLine,
  Wallet,
  LogOut,
} from "lucide-react";

const MENU = [
  { id: 1, name: "Dashboard", icon: LayoutDashboard, path: "/home" },
  { id: 2, name: "Movimientos", icon: ArrowRightLeft, path: "/movimientos" },
  { id: 3, name: "Presupuestos", icon: ChartLine, path: "/presupuesto" },
  { id: 4, name: "Cuentas", icon: Wallet, path: "/cuentas" },
];

export const Sidebar = ({ handleLogout }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`fixed left-0 top-0 z-40 h-screen flex flex-col glass-panel border-r border-default transition-[width] duration-slow ease-standard select-none ${
        expanded ? "w-[224px]" : "w-[64px]"
      }`}
    >
      {/* Brand */}
      <div className="h-16 flex items-center px-4 border-b border-default">
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
          {/* Pulsing glow ring */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-lg animate-pulse-glow pointer-events-none"
          />
        </div>
        <span
          className={`ml-3 font-display font-semibold text-primary text-[15px] tracking-tight whitespace-nowrap transition-opacity duration-200 ease-standard ${
            expanded ? "opacity-100 delay-75" : "opacity-0 pointer-events-none"
          }`}
        >
          Finanzas
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 pt-3 space-y-1">
        {MENU.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              className={`relative w-full h-10 flex items-center rounded-lg overflow-hidden transition-all duration-base ease-standard group ${
                isActive
                  ? "bg-accent-soft text-primary"
                  : "text-secondary hover:bg-elevated hover:text-primary"
              }`}
            >
              {/* Active indicator bar — gradient with glow */}
              <span
                aria-hidden
                className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full transition-all duration-base ease-standard ${
                  isActive
                    ? "bg-brand-gradient opacity-100 shadow-[0_0_12px_rgba(6,182,212,0.7)]"
                    : "bg-accent opacity-0"
                }`}
              />
              {/* Active dot ping (visible when collapsed) */}
              {isActive && !expanded && (
                <span
                  aria-hidden
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                />
              )}
              <div className="w-[48px] flex items-center justify-center flex-shrink-0">
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.25 : 1.85}
                  className={`transition-colors duration-base ${
                    isActive ? "text-accent" : "group-hover:text-primary"
                  }`}
                />
              </div>
              <span
                className={`text-[13px] font-medium whitespace-nowrap transition-opacity duration-200 ease-standard ${
                  expanded ? "opacity-100 delay-75" : "opacity-0 pointer-events-none"
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-default p-2">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full h-10 flex items-center rounded-lg text-secondary hover:bg-elevated hover:text-danger transition-colors duration-base group"
        >
          <div className="w-[48px] flex items-center justify-center flex-shrink-0">
            <LogOut size={16} strokeWidth={1.85} className="transition-transform duration-base group-hover:-translate-x-0.5" />
          </div>
          <span
            className={`text-[13px] font-medium whitespace-nowrap transition-opacity duration-200 ease-standard ${
              expanded ? "opacity-100 delay-75" : "opacity-0 pointer-events-none"
            }`}
          >
            Cerrar sesión
          </span>
        </button>
      </div>

      {/* Decorative cyan glow at bottom */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-accent/[0.06] to-transparent pointer-events-none"
      />
    </aside>
  );
};
