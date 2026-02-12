import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '@/lib/pocketbase';

export function useToggleSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subtaskId,
      isCompleted,
    }: {
      subtaskId: string;
      isCompleted: boolean;
    }) => {
      return await pb.collection('subtasks').update(subtaskId, {
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', data.goal] });
    },
  });
}
