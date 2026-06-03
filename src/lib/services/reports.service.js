import { supabase } from '../../lib/supabaseClient'

export async function getDashboardReport(fromDate, toDate) {
  const { data, error } = await supabase.rpc('report_dashboard', {
    from_date: fromDate,
    to_date:   toDate,
  })

  if (error) throw error
  return data
}
export async function getRecentEntries(limit = 5) {
  const { data, error } = await supabase.rpc('get_recent_entries', {
    p_limit: limit,
  })

  if (error) throw error
  return data ?? []
}

/**
 * Serie mensual de ingresos y gastos en el rango [from, to).
 * Devuelve filas { month: 'YYYY-MM-DD', income, expense } (solo meses con datos).
 */
export async function getMonthlyTotals(fromDate, toDate) {
  const { data, error } = await supabase.rpc('report_monthly_totals', {
    p_from: fromDate,
    p_to: toDate,
  })

  if (error) throw error
  return data ?? []
}

/**
 * Gasto agrupado por categoría en el rango [from, to).
 */
export async function getExpenseByCategory(fromDate, toDate) {
  const { data, error } = await supabase.rpc('report_expense_by_category', {
    from_date: fromDate,
    to_date: toDate,
  })

  if (error) throw error
  return data ?? []
}