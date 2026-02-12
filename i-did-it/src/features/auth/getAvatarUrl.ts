import { pb } from '@/lib/pocketbase';
import type { User } from './types';

export function getAvatarUrl(user: User): string | null {
  if (!user.avatar) return null;
  return pb.files.getUrl(user, user.avatar);
}
