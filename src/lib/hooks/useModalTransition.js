import { useState, useEffect } from "react";

/**
 * Mantiene un modal montado durante su animación de cierre.
 * - Al abrir, monta de inmediato (ajuste de estado en render, patrón recomendado por React).
 * - Al cerrar, espera `duration` ms antes de desmontar.
 * Devuelve `visible` (si debe renderizarse).
 */
export function useModalTransition(isOpen, duration = 280) {
  const [visible, setVisible] = useState(isOpen);

  if (isOpen && !visible) setVisible(true);

  useEffect(() => {
    if (!isOpen && visible) {
      const t = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isOpen, visible, duration]);

  return visible;
}
