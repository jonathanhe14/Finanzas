export function getCurrentMonthRange() {
  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.getMonth()

  const from = new Date(year, month, 1)
  const to   = new Date(year, month + 1, 1)

  return {
    from: from.toISOString().slice(0, 10),
    to:   to.toISOString().slice(0, 10),
  }
}