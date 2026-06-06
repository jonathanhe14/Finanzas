import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMovement, reconocerGanancia } from "../../../lib/services/movements.service";
import { QUERY_KEYS } from "../../../lib/constants/queryKeys";

function invalidateMovementQueries(qc) {
  qc.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_REPORT] });
  qc.invalidateQueries({ queryKey: [QUERY_KEYS.RECENT_MOVEMENTS] });
  qc.invalidateQueries({ queryKey: [QUERY_KEYS.JOURNAL_ENTRIES] });
  qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTS] });
  qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNT_BALANCES] });
}

export function useCreateMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMovement,
    onSuccess: () => invalidateMovementQueries(qc),
  });
}

export function useReconocerGanancia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reconocerGanancia,
    onSuccess: () => invalidateMovementQueries(qc),
  });
}
