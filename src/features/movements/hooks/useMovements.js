import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listMovements,
  updateMovement,
  deleteMovement,
} from "../../../lib/services/movements.service";
import { QUERY_KEYS } from "../../../lib/constants/queryKeys";

export function useMovements(limit = 200) {
  return useQuery({
    queryKey: [QUERY_KEYS.JOURNAL_ENTRIES, limit],
    queryFn: () => listMovements(limit),
    staleTime: 1000 * 60 * 2, // 2 min
  });
}

function invalidateAll(qc) {
  qc.invalidateQueries({ queryKey: [QUERY_KEYS.JOURNAL_ENTRIES] });
  qc.invalidateQueries({ queryKey: [QUERY_KEYS.RECENT_MOVEMENTS] });
  qc.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_REPORT] });
  qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTS] });
  qc.invalidateQueries({ queryKey: [QUERY_KEYS.BUDGET_PROGRESS] });
}

export function useUpdateMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMovement,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeleteMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMovement,
    onSuccess: () => invalidateAll(qc),
  });
}
