import { useQuery } from '@tanstack/react-query';
import { pb } from '@/lib/pocketbase';
import type { Entry } from '@/types/entry';

export function useEntries(goalId: string) {
  return useQuery({
    queryKey: ['entries', goalId],
    queryFn: () =>
      pb.collection('entries').getFullList<Entry>({
        filter: `goal = "${goalId}"`,
        sort: '-created',
        expand: 'user',
      }),
    enabled: !!goalId,
  });
}
