import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listGoals,
  createGoal,
  updateGoal,
  setGoalActive,
  deleteGoal,
} from "../../../lib/services/goals.service";
import { QUERY_KEYS } from "../../../lib/constants/queryKeys";

export function useGoals() {
  return useQuery({
    queryKey: [QUERY_KEYS.GOALS],
    queryFn: listGoals,
    staleTime: 1000 * 60 * 2,
  });
}

function invalidate(qc) {
  qc.invalidateQueries({ queryKey: [QUERY_KEYS.GOALS] });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createGoal, onSuccess: () => invalidate(qc) });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...rest }) => updateGoal(id, rest),
    onSuccess: () => invalidate(qc),
  });
}

export function useSetGoalActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }) => setGoalActive(id, is_active),
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteGoal, onSuccess: () => invalidate(qc) });
}
