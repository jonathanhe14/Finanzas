import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMonthlyBudget,
  getExpenseSpent,
  upsertBudgetLine,
  createMonthlyBudget,
} from "../../../lib/services/budgets.service";
import { QUERY_KEYS } from "../../../lib/constants/queryKeys";

export function useMonthlyBudget() {
  return useQuery({
    queryKey: [QUERY_KEYS.BUDGETS],
    queryFn: getMonthlyBudget,
    staleTime: 1000 * 60 * 5,
  });
}

export function useExpenseSpent(from, to) {
  return useQuery({
    queryKey: [QUERY_KEYS.BUDGET_PROGRESS, from, to],
    queryFn: () => getExpenseSpent(from, to),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpsertBudgetLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertBudgetLine,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.BUDGETS] });
    },
  });
}

export function useCreateMonthlyBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMonthlyBudget,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.BUDGETS] });
    },
  });
}
