import { useQuery } from '@tanstack/react-query';
import { pb } from '@/lib/pocketbase';
import type { Goal } from '@/types/goal';

export function useGoal(goalId: string) {
  return useQuery({
    queryKey: ['goal', goalId],
    queryFn: async () => {
      const goal = await pb.collection('goals').getOne<Goal>(goalId, {
        expand: 'user',
      });

      // Инкремент просмотров (fire and forget)
      pb.collection('goals')
        .update(goalId, {
          'views_count+': 1,
        })
        .catch(() => {});

      return goal;
    },
    enabled: !!goalId,
    retry: (failureCount, error) => {
      const err = error as { status?: number };
      if (err?.status === 404) return false;
      return failureCount < 2;
    },
  });
}
