import { useQuery } from '@tanstack/react-query';
import { pb } from '@/lib/pocketbase';
import type { Profile } from '@/types/profile';

export function useProfile(username: string) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const record = await pb.collection('users').getFirstListItem<Profile>(
        `username = "${username}"`
      );
      return record;
    },
    enabled: !!username,
  });
}
