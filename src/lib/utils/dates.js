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

/**
 * Fecha corta localizada, ej. "5 jun" (es-CR).
 */
export function formatShortDate(dateStr) {
  const [y, m, d] = String(dateStr).slice(0, 10).split("-").map(Number)
  return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString("es-CR", {
    day: "numeric",
    month: "short",
  })
}

/**
 * Badge de vencimiento para una fecha (YYYY-MM-DD): texto + clases Tailwind.
 * "Vencido hace Xd" / "Hoy" / "En X días", coloreado según urgencia.
 */
export function dueBadge(dateStr) {
  const d = daysUntil(dateStr)
  if (d < 0)
    return { text: `Vencido hace ${Math.abs(d)}d`, cls: "bg-danger/10 text-danger border-danger/30" }
  if (d === 0) return { text: "Hoy", cls: "bg-warning/10 text-warning border-warning/30" }
  if (d <= 7)
    return { text: `En ${d} día${d === 1 ? "" : "s"}`, cls: "bg-warning/10 text-warning border-warning/30" }
  return { text: `En ${d} días`, cls: "bg-elevated text-muted border-default" }
}

/**
 * Rango de "días móviles" terminado hoy: incluye los últimos `days` días.
 * Devuelve { from, to } como YYYY-MM-DD, con `to` exclusivo (mañana) para usarse
 * con `entry_date >= from AND entry_date < to`.
 */
export function getRollingRange(days) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const from = new Date(today)
  from.setDate(today.getDate() - (days - 1))
  const to = new Date(today)
  to.setDate(today.getDate() + 1)
  const fmt = (dt) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`
  return { from: fmt(from), to: fmt(to) }
}