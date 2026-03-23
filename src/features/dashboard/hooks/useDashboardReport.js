import { useQuery } from '@tanstack/react-query'
import { getDashboardReport } from '../../../lib/services/reports.service'
import { getCurrentMonthRange } from '../../../lib/utils/dates'
import { QUERY_KEYS } from '../../../lib/constants/queryKeys'

export function useDashboardReport(fromDate, toDate) {
  const defaultRange = getCurrentMonthRange()
  const from = fromDate ?? defaultRange.from
  const to   = toDate   ?? defaultRange.to

  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_REPORT, from, to],
    queryFn:  () => getDashboardReport(from, to),
    staleTime: 1000 * 60 * 5,
  })
}