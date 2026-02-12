import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '@/lib/pocketbase';

export function useDeleteEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entryId, goalId }: { entryId: string; goalId: string }) => {
      await pb.collection('entries').delete(entryId);
      return { entryId, goalId };
    },
    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: ['entries', goalId] });
    },
  });
}
