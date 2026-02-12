import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '@/lib/pocketbase';
import type { Goal, GoalStatus } from '@/types/goal';

export function useUpdateGoalStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      goalId,
      status,
      comment,
      image,
    }: {
      goalId: string;
      status: GoalStatus;
      comment: string;
      image?: File;
    }) => {
      const formData = new FormData();
      formData.append('status', status);
      formData.append('status_comment', comment);
      if (image) formData.append('status_image', image);

      const goal = await pb.collection('goals').update<Goal>(goalId, formData, {
        expand: 'user',
      });

      // Обновляем счётчик выполненных целей
      if (status === 'completed') {
        const userId = typeof goal.user === 'string' ? goal.user : (goal.expand?.user as { id: string })?.id;
        if (userId) {
          await pb.collection('users').update(userId, {
            'completed_goals_count+': 1,
          });
        }
      }

      return goal;
    },
    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}
