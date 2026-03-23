import { useQuery } from '@tanstack/react-query'
import { getRecentEntries } from '../../../lib/services/reports.service'
import { QUERY_KEYS } from '../../../lib/constants/queryKeys'

export function useRecentEntries(limit = 5) {
  return useQuery({
    queryKey: [QUERY_KEYS.RECENT_MOVEMENTS, limit],
    queryFn:  () => getRecentEntries(limit),
    staleTime: 1000 * 60 * 2, // 2 min — los movimientos cambian más seguido
  })
}