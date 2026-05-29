const FORMATTERS = new Map();

function getFormatter(currency = "CRC") {
  if (!FORMATTERS.has(currency)) {
    FORMATTERS.set(
      currency,
      new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    );
  }
  return FORMATTERS.get(currency);
}

export function formatMoney(amount, currency = "CRC") {
  const n = Number(amount ?? 0);
  return getFormatter(currency).format(n);
}

export function formatSignedMoney(amount, currency = "CRC", { positiveSign = false } = {}) {
  const n = Number(amount ?? 0);
  const formatted = formatMoney(Math.abs(n), currency);
  if (n < 0) return `−${formatted}`; // unicode minus
  if (n > 0 && positiveSign) return `+${formatted}`;
  return formatted;
}
