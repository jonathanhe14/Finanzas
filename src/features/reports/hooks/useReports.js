import { useQuery } from "@tanstack/react-query";
import {
  getMonthlyTotals,
  getExpenseByCategory,
} from "../../../lib/services/reports.service";
import { QUERY_KEYS } from "../../../lib/constants/queryKeys";

export function useMonthlyTotals(from, to) {
  return useQuery({
    queryKey: [QUERY_KEYS.MONTHLY_TOTALS, from, to],
    queryFn: () => getMonthlyTotals(from, to),
    staleTime: 1000 * 60 * 5,
  });
}

export function useExpenseByCategory(from, to) {
  return useQuery({
    queryKey: [QUERY_KEYS.EXPENSE_BY_CATEGORY, from, to],
    queryFn: () => getExpenseByCategory(from, to),
    staleTime: 1000 * 60 * 5,
  });
}
