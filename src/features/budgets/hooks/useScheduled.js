import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listScheduledEntries,
  getScheduledPostings,
  createScheduledEntry,
  updateScheduledEntry,
  setScheduledActive,
  postScheduledEntry,
} from "../../../lib/services/scheduled.service";
import { QUERY_KEYS } from "../../../lib/constants/queryKeys";

export function useScheduledEntries() {
  return useQuery({
    queryKey: [QUERY_KEYS.SCHEDULED],
    queryFn: listScheduledEntries,
    staleTime: 1000 * 60 * 2,
  });
}

export function useScheduledPostings(scheduled_id) {
  return useQuery({
    queryKey: [QUERY_KEYS.SCHEDULED, "postings", scheduled_id],
    queryFn: () => getScheduledPostings(scheduled_id),
    enabled: !!scheduled_id,
  });
}

export function useCreateScheduledEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createScheduledEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.SCHEDULED] });
    },
  });
}

export function useUpdateScheduledEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => updateScheduledEntry(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.SCHEDULED] });
    },
  });
}

export function useSetScheduledActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }) => setScheduledActive(id, is_active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.SCHEDULED] });
    },
  });
}

export function usePostScheduledEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, entry_date } = {}) => postScheduledEntry(id, { entry_date }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.SCHEDULED] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_REPORT] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.RECENT_MOVEMENTS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.JOURNAL_ENTRIES] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.BUDGET_PROGRESS] });
    },
  });
}
