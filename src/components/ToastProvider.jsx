import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastContext) ?? noop;
}

const noop = { toast: () => {}, success: () => {}, error: () => {} };

const STYLES = {
  success: { Icon: CheckCircle2, cls: "border-success/40 text-success" },
  error: { Icon: AlertCircle, cls: "border-danger/40 text-danger" },
  info: { Icon: Info, cls: "border-accent/40 text-accent" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((list) => [...list, { id, message, type }]);
      setTimeout(() => remove(id), 4500);
    },
    [remove],
  );

  const api = useMemo(
    () => ({
      toast: (m) => push(m, "info"),
      success: (m) => push(m, "success"),
      error: (m) => push(m, "error"),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-[min(360px,calc(100vw-2rem))] pointer-events-none">
        {toasts.map((t) => {
          const { Icon, cls } = STYLES[t.type] ?? STYLES.info;
          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-2.5 bg-surface border ${cls} rounded-xl shadow-modal px-3.5 py-3 toast-in`}
            >
              <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={2} />
              <p className="text-caption text-primary flex-1 break-words">{t.message}</p>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="text-muted hover:text-primary transition-colors duration-base flex-shrink-0"
                aria-label="Cerrar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
