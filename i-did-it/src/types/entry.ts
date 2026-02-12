import type { User } from '../features/auth/types';
import type { Goal } from './goal';

export interface Entry {
  id: string;
  goal: string;
  user: string;
  content: string;
  attachments: string[];
  likes_count: number;
  comments_count: number;
  created: string;
  updated: string;
  expand?: {
    user?: User;
    goal?: Goal;
  };
}
