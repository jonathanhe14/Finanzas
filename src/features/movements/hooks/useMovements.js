import { useQuery } from "@tanstack/react-query";
import { listMovements } from "../../../lib/services/movements.service";
import { QUERY_KEYS } from "../../../lib/constants/queryKeys";

export function useMovements(limit = 200) {
  return useQuery({
    queryKey: [QUERY_KEYS.JOURNAL_ENTRIES, limit],
    queryFn: () => listMovements(limit),
    staleTime: 1000 * 60 * 2, // 2 min
  });
}
