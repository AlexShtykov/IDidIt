import { useQuery } from '@tanstack/react-query';
import { pb } from '@/lib/pocketbase';
import type { Subtask } from '@/types/goal';

export function useGoalSubtasks(goalId: string) {
  return useQuery({
    queryKey: ['subtasks', goalId],
    queryFn: async () => {
      return await pb.collection('subtasks').getFullList<Subtask>({
        filter: `goal = "${goalId}"`,
        sort: 'sort_order',
      });
    },
    enabled: !!goalId,
  });
}
