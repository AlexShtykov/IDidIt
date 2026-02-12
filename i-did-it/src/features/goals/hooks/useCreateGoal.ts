import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '@/lib/pocketbase';
import type { CreateGoalInput, Goal } from '@/types/goal';

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateGoalInput & { userId: string }): Promise<Goal> => {
      const formData = new FormData();
      formData.append('user', input.userId);
      formData.append('title', input.title);
      if (input.description) formData.append('description', input.description);
      if (input.target_date) formData.append('target_date', input.target_date);

      // Добавляем изображения
      input.images?.forEach((file) => {
        formData.append('images', file);
      });

      // Создаём цель
      const goal = await pb.collection('goals').create<Goal>(formData);

      // Создаём подзадачи
      if (input.subtasks?.length) {
        await Promise.all(
          input.subtasks.map((subtask, index) =>
            pb.collection('subtasks').create({
              goal: goal.id,
              title: subtask.title,
              target_date: subtask.target_date || null,
              sort_order: index,
            })
          )
        );
      }

      // Обновляем счётчик целей у пользователя
      await pb.collection('users').update(input.userId, {
        'goals_count+': 1,
      });

      return goal;
    },
    onSuccess: (goal) => {
      if (goal?.id) {
        queryClient.setQueryData(['goal', goal.id], goal);
      }
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}
