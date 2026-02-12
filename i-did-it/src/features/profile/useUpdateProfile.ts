import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '@/lib/pocketbase';
import type { Profile, UpdateProfileParams } from '@/types/profile';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: UpdateProfileParams) => {
      return await pb.collection('users').update<Profile>(userId, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile', data.username] });
    },
  });
}
