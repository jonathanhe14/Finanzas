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