import { Menu } from "lucide-react";
import { useMobileNav } from "../context/MobileNavContext";

/**
 * Botón hamburguesa que abre el drawer de navegación móvil.
 * Solo visible en `< md`; en escritorio la navegación es el Sidebar lateral.
 */
export function MobileMenuButton() {
  const { open } = useMobileNav();
  return (
    <button
      type="button"
      onClick={open}
      aria-label="Abrir menú"
      className="md:hidden w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg text-secondary hover:bg-elevated hover:text-primary transition-colors duration-base"
    >
      <Menu className="w-5 h-5" strokeWidth={2} />
    </button>
  );
}
