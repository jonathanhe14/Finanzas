import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowRightLeft,
  ChartLine,
  Wallet,
} from "lucide-react";

export const Sidebar = ({ handleLogout }) => {
  const menu = [
    {
      id: 1,
      name: "Dashboard",
      icon: <LayoutDashboard size={16} color="white" />,
      path: "/home",
    },
    {
      id: 2,
      name: "Movimientos",
      icon: <ArrowRightLeft size={16} color="white" />,
      path: "/movimientos",
    },
    {
      id: 3,
      name: "Presupuestos",
      icon: <ChartLine size={16} color="white" />,
      path: "/presupuesto",
    },
    {
      id: 4,
      name: "Cuentas",
      icon: <Wallet size={16} color="white" />,
      path: "/cuentas",
    },
  ];

  const navigate = useNavigate();
  const location = useLocation();
  return (
    <aside className="w-[200px] min-h-screen bg-[#0E0E0D] flex flex-col fixed left-0 top-0 z-20 select-none">
      <div className="px-5 pt-6 pb-5 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="font-semibold text-white tracking-tight text-[15px]">
            Finanzas App
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 pt-4 space-y-0.5">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] ${isActive ? " bg-white/[0.09] cursor-pointer" : "hover:bg-white/[0.06] cursor-pointer group nav-pill"} `}
              onClick={() => navigate(item.path)}
            >
              <div
                className={`w-6 h-6 ${isActive ? "rounded-lg bg-white/10" : ""} flex items-center justify-center`}
              >
                {item.icon}
              </div>
              <span className="text-white text-[13px] font-medium">
                {item.name}
              </span>
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/[0.07]">
        <div
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] hover:bg-white/[0.06] cursor-pointer transition-colors"
        >
          <div className="min-w-0">
            <div className="text-white text-[12px] font-medium leading-none truncate">
              Cerrar Sesion
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
