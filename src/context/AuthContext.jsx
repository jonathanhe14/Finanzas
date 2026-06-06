import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext({ session: null, user: null, loading: true });

/**
 * Provee el estado de autenticación a toda la app de forma reactiva.
 *
 * - Al montar lee la sesión persistida con `getSession()` para no parpadear
 *   hacia /login en un refresh cuando el usuario sí está autenticado.
 * - Luego se suscribe a `onAuthStateChange` para reflejar login/logout,
 *   refresh de token y recuperación de contraseña sin recargar la página.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = { session, user: session?.user ?? null, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
