import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '@/lib/pocketbase';
import type { Entry } from '@/types/entry';

export function useCreateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      goalId,
      userId,
      content,
      attachments,
    }: {
      goalId: string;
      userId: string;
      content: string;
      attachments?: File[];
    }) => {
      const formData = new FormData();
      formData.append('goal', goalId);
      formData.append('user', userId);
      formData.append('content', content);
      attachments?.forEach((file) => formData.append('attachments', file));

      return pb.collection('entries').create<Entry>(formData);
    },
    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: ['entries', goalId] });
    },
  });
}
