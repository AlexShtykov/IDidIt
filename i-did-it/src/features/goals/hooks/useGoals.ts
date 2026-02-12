import { useQuery } from '@tanstack/react-query';
import { pb } from '@/lib/pocketbase';
import type { GoalStatus } from '@/types/goal';

export interface UseGoalsParams {
  userId?: string;
  status?: GoalStatus;
  limit?: number;
  page?: number;
}

export function useGoals(params: UseGoalsParams = {}) {
  const { userId, status, limit = 20, page = 1 } = params;

  // Не запрашивать список "моих" целей, пока нет userId (если передан userId: undefined — ждём загрузки user)
  const wantsUserFilter = 'userId' in params;
  const enabled = !wantsUserFilter || !!userId;

  return useQuery({
    queryKey: ['goals', params],
    queryFn: async () => {
      const filters: string[] = [];
      if (userId) filters.push(`user = "${userId}"`);
      if (status) filters.push(`status = "${status}"`);

      return await pb.collection('goals').getList(page, limit, {
        filter: filters.length > 0 ? filters.join(' && ') : undefined,
        sort: '-created',
        expand: 'user',
      });
    },
    enabled,
  });
}
