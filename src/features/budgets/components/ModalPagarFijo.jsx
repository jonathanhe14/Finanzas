import { useState, useEffect, useCallback } from "react";
import { X, Check } from "lucide-react";
import { useAccountsList, useAccountBalances } from "../../accounts/hooks/useAccountsList";
import { useModalTransition } from "../../../lib/hooks/useModalTransition";
import { formatMoney } from "../../../lib/utils/money";

const inputCls =
  "w-full bg-sunken border border-default rounded-md px-3.5 py-2.5 text-body font-medium text-primary placeholder:text-faint focus:outline-none focus:border-accent focus:shadow-focus transition-all duration-base";
const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
};

export default function ModalPagarFijo({ isOpen, onClose, entry, onConfirm, saving = false }) {
  const visible = useModalTransition(isOpen);
  const { data: accounts = [] } = useAccountsList();
  const { data: balances = {} } = useAccountBalances();
  const [accountId, setAccountId] = useState("");

  const currency = entry?.currency_code ?? "CRC";
  // Se paga desde una cuenta de dinero (activo) o tarjeta/pasivo, en la misma moneda.
  const payAccounts = accounts.filter(
    (a) => (a.type === "ASSET" || a.type === "LIABILITY") && a.currency_code === currency,
  );
  const firstPayId = payAccounts[0] ? String(payAccounts[0].id) : "";

  // Reinicia la selección al abrir (ajuste de estado en render, como los otros modales).
  const [prevOpen, setPrevOpen] = useState(false);
  if (isOpen && !prevOpen) {
    setPrevOpen(true);
    setAccountId("");
  }
  if (!isOpen && prevOpen) setPrevOpen(false);

  // Default a la primera cuenta cuando lleguen las cuentas (datos async).
  useEffect(() => {
    if (isOpen && !accountId && firstPayId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAccountId(firstPayId);
    }
  }, [isOpen, accountId, firstPayId]);

  const handleKey = useCallback((e) => { if (e.key === "Escape") onClose(); }, [onClose]);
  useEffect(() => {
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, handleKey]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!visible || !entry) return null;

  const saldo = accountId ? balances[Number(accountId)] : undefined;

  return (
    <div
      className={`fixed inset-0 z-[110] flex items-center justify-center transition-opacity duration-slow ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div
        className={`relative z-[111] bg-surface rounded-3xl w-full max-w-[420px] mx-4 my-auto flex flex-col transition-all duration-slow ease-standard shadow-modal ${
          isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-[0.96]"
        }`}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-default">
          <div>
            <h2 className="font-display text-h2 text-primary">Registrar pago</h2>
            <p className="text-caption text-muted mt-1 truncate">{entry.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-elevated hover:bg-base flex items-center justify-center transition-colors duration-base flex-shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-3.5 h-3.5 text-muted" strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="flex items-center justify-between bg-sunken border border-default rounded-md px-3.5 py-3">
            <span className="text-caption text-muted uppercase tracking-wider">Monto</span>
            <span className="amount text-num-md text-primary">
              {formatMoney(entry.installment_amount, currency)}
            </span>
          </div>

          <div>
            <label className="block text-eyebrow text-muted uppercase mb-2">Pagar desde</label>
            {payAccounts.length === 0 ? (
              <div className="text-caption text-muted bg-elevated border border-dashed border-default rounded-md px-3 py-2">
                No tienes cuentas en {currency} para pagar. Crea una en la pestaña Cuentas.
              </div>
            ) : (
              <>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className={`${inputCls} appearance-none`}
                  style={selectStyle}
                >
                  {payAccounts.map((a) => (
                    <option key={a.id} value={a.id} className="bg-surface">
                      {a.name}
                    </option>
                  ))}
                </select>
                {saldo != null && (
                  <p className="text-caption text-muted mt-1.5">
                    Saldo actual:{" "}
                    <span className="amount text-secondary">{formatMoney(saldo, currency)}</span>
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 flex gap-2.5 border-t border-default">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 text-[13px] font-medium text-secondary bg-elevated hover:bg-base border border-default rounded-md py-2.5 transition-colors duration-base"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(Number(accountId))}
            disabled={!accountId || saving}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold text-white rounded-md py-2.5 transition-all duration-base ease-standard bg-brand-gradient hover:shadow-glow active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
            {saving ? "Registrando…" : "Pagar"}
          </button>
        </div>
      </div>
    </div>
  );
}
