export function getMonthRange(year, month) {
  const from = new Date(year, month, 1)
  const to   = new Date(year, month + 1, 1)

  return {
    from: from.toISOString().slice(0, 10),
    to:   to.toISOString().slice(0, 10),
  }
}

export function getCurrentMonthRange() {
  const now = new Date()
  return getMonthRange(now.getFullYear(), now.getMonth())
}

/**
 * Avanza una fecha (YYYY-MM-DD) según una regla de recurrencia tipo iCal.
 * Soporta FREQ=MONTHLY (default), WEEKLY y YEARLY, con INTERVAL opcional.
 * Devuelve la próxima fecha como YYYY-MM-DD.
 */
export function advanceByRRule(dateStr, rrule) {
  const [y, m, d] = String(dateStr).slice(0, 10).split("-").map(Number)
  const base = new Date(y, (m || 1) - 1, d || 1)

  const parts = {}
  for (const token of String(rrule || "").split(";")) {
    const [k, v] = token.split("=")
    if (k) parts[k.trim().toUpperCase()] = (v || "").trim().toUpperCase()
  }

  const interval = Math.max(1, parseInt(parts.INTERVAL, 10) || 1)
  const freq = parts.FREQ || "MONTHLY"

  if (freq === "WEEKLY") base.setDate(base.getDate() + 7 * interval)
  else if (freq === "YEARLY") base.setFullYear(base.getFullYear() + interval)
  else base.setMonth(base.getMonth() + interval) // MONTHLY (default)

  const mm = String(base.getMonth() + 1).padStart(2, "0")
  const dd = String(base.getDate()).padStart(2, "0")
  return `${base.getFullYear()}-${mm}-${dd}`
}

/**
 * Días enteros desde hoy hasta la fecha dada (YYYY-MM-DD).
 * Negativo = vencido, 0 = hoy. Ignora la hora (compara a medianoche local).
 */
export function daysUntil(dateStr) {
  const [y, m, d] = String(dateStr).slice(0, 10).split("-").map(Number)
  const target = new Date(y, (m || 1) - 1, d || 1)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target - today) / 86400000)
}