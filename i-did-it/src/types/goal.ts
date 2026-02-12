import type { User } from '../features/auth/types';

export type GoalStatus = 'active' | 'completed' | 'cancelled';

export interface Goal {
  id: string;
  collectionId: string;
  collectionName: string;
  user: string;
  title: string;
  description?: string;
  target_date?: string;
  status: GoalStatus;
  status_comment?: string;
  status_image?: string;
  images: string[];
  views_count: number;
  likes_count: number;
  comments_count: number;
  created: string;
  updated: string;
  // Expanded relations
  expand?: {
    user?: User;
  };
}

export interface Subtask {
  id: string;
  goal: string;
  title: string;
  target_date?: string;
  is_completed: boolean;
  completed_at?: string;
  sort_order: number;
  created: string;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  target_date?: string;
  images?: File[];
  subtasks?: { title: string; target_date?: string }[];
}
