import type { RecordModel } from 'pocketbase';

/** Запись пользователя из коллекции users (профиль) */
export interface Profile extends RecordModel {
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

/** Данные для обновления профиля (без файлов) */
export interface UpdateProfileData {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
}

/** Аргументы мутации обновления профиля */
export interface UpdateProfileParams {
  userId: string;
  data: FormData | UpdateProfileData;
}
