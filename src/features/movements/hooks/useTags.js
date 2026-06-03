import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listTags, createTag } from "../../../lib/services/tags.service";
import { QUERY_KEYS } from "../../../lib/constants/queryKeys";

export function useTags() {
  return useQuery({
    queryKey: [QUERY_KEYS.TAGS],
    queryFn: listTags,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTag,
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.TAGS] }),
  });
}
