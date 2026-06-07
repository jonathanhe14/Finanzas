import {
  LayoutDashboard,
  ArrowRightLeft,
  ChartLine,
  BarChart3,
  Target,
  Wallet,
} from "lucide-react";

// Secciones de navegación, compartidas por el Sidebar de escritorio
// (src/components/Sidebar.jsx) y el drawer móvil (src/context/MobileNavContext.jsx).
export const MENU = [
  { id: 1, name: "Dashboard", icon: LayoutDashboard, path: "/home" },
  { id: 2, name: "Movimientos", icon: ArrowRightLeft, path: "/movimientos" },
  { id: 3, name: "Presupuestos", icon: ChartLine, path: "/presupuesto" },
  { id: 4, name: "Reportes", icon: BarChart3, path: "/reportes" },
  { id: 5, name: "Metas", icon: Target, path: "/metas" },
  { id: 6, name: "Cuentas", icon: Wallet, path: "/cuentas" },
];
