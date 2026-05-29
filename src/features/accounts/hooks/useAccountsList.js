import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAccounts,
  listCurrencies,
  createAccount,
  archiveAccount,
} from "../../../lib/services/accounts.service";
import { QUERY_KEYS } from "../../../lib/constants/queryKeys";

export function useAccountsList() {
  return useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS],
    queryFn: listAccounts,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCurrencies() {
  return useQuery({
    queryKey: [QUERY_KEYS.CURRENCIES],
    queryFn: listCurrencies,
    staleTime: 1000 * 60 * 60,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTS] });
    },
  });
}

export function useArchiveAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: archiveAccount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTS] });
    },
  });
}
