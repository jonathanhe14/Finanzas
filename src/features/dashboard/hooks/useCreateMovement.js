import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMovement } from "../../../lib/services/movements.service";
import { QUERY_KEYS } from "../../../lib/constants/queryKeys";

export function useCreateMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMovement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_REPORT] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.RECENT_MOVEMENTS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTS] });
    },
  });
}
