import type { RecordModel } from 'pocketbase';

export interface User extends RecordModel {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar?: string;
  followers_count: number;
  following_count: number;
  goals_count: number;
  completed_goals_count: number;
}
