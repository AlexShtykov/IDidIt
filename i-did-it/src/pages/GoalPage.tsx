import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { pb } from '@/lib/pocketbase';
import { useAuthContext } from '@/features/auth';
import {
  useGoal,
  useGoalSubtasks,
  useToggleSubtask,
  useUpdateGoalStatus,
} from '@/features/goals';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import type { Goal } from '@/types/goal';
import type { User } from '@/features/auth';
import { cn } from '@/lib/utils';

function getImageUrl(goal: Goal, filename: string) {
  return pb.files.getUrl(goal, filename);
}

const STATUS_LABELS: Record<Goal['status'], string> = {
  active: 'В процессе',
  completed: 'Достигнуто 🎉',
  cancelled: 'Отменена',
};

const STATUS_BADGE_CLASS: Record<Goal['status'], string> = {
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

function GoalPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="h-6 w-24 bg-muted rounded animate-pulse" />
        <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-muted animate-pulse" />
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-4 w-full max-w-md bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-video bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-muted rounded animate-pulse" />
        <div className="h-3 w-4/5 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-24 bg-muted rounded-lg animate-pulse" />
    </div>
  );
}

function NotFoundGoal() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-bold text-foreground">Цель не найдена</h1>
      <p className="mt-2 text-muted-foreground">
        Такой цели не существует или она была удалена.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link to="/">На главную</Link>
      </Button>
    </div>
  );
}

export function GoalPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const { data: goal, isLoading, isError } = useGoal(id ?? '');
  const { data: subtasks = [] } = useGoalSubtasks(id ?? '');
  const toggleSubtask = useToggleSubtask();
  const updateStatus = useUpdateGoalStatus();
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);

  if (!id) {
    return <NotFoundGoal />;
  }

  if (isLoading) {
    return <GoalPageSkeleton />;
  }

  if (isError || !goal) {
    return <NotFoundGoal />;
  }

  const author = goal.expand?.user as User | undefined;
  const isOwner = goal.user === user?.id;
  const getImageUrlForGoal = (filename: string) => getImageUrl(goal, filename);

  const targetDate = goal.target_date ? new Date(goal.target_date) : null;
  const daysLeft = targetDate ? differenceInDays(targetDate, new Date()) : null;
  const deadlineLabel =
    targetDate != null
      ? daysLeft! < 0
        ? `Просрочено на ${Math.abs(daysLeft!)} дн.`
        : `Осталось ${daysLeft} дн.`
      : null;
  const deadlineClass =
    targetDate != null
      ? daysLeft! < 0
        ? 'text-red-600'
        : daysLeft! <= 7
          ? 'text-orange-600'
          : 'text-muted-foreground'
      : '';

  const completedSubtasks = subtasks.filter((s) => s.is_completed).length;
  const totalSubtasks = subtasks.length;
  const progressPercent =
    totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const handleMarkCompleted = () => {
    updateStatus.mutate({ goalId: goal.id, status: 'completed', comment: '' });
  };
  const handleMarkCancelled = () => {
    updateStatus.mutate({ goalId: goal.id, status: 'cancelled', comment: '' });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
      {/* Шапка */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className={cn(
              'font-medium',
              STATUS_BADGE_CLASS[goal.status]
            )}
          >
            {STATUS_LABELS[goal.status]}
          </Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          {goal.title}
        </h1>

        {author && (
          <div className="flex items-center gap-2 text-sm">
            <Link
              to={`/profile/${author.username}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Avatar className="size-8">
                {author.avatar ? (
                  <AvatarImage
                    src={pb.files.getUrl(author, author.avatar)}
                    alt={author.username}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                  {(author.first_name?.[0] ?? author.username[0] ?? '?').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">{author.username}</span>
            </Link>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>
            Создано {formatDistanceToNow(new Date(goal.created), { locale: ru, addSuffix: true })}
          </span>
          {deadlineLabel && (
            <span className={cn('font-medium', deadlineClass)}>{deadlineLabel}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {goal.views_count} 👁 | {goal.comments_count} 💬 | {goal.likes_count} ❤️
          </span>
          <Button variant="outline" size="sm" disabled>
            ❤️ Нравится
          </Button>
          {isOwner && (
            <>
              <Button asChild variant="outline" size="sm">
                <Link to={`/goals/${goal.id}/edit`}>Редактировать</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <span className="sr-only">Меню</span>
                    ⋯
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleMarkCompleted}
                    disabled={goal.status === 'completed'}
                  >
                    Отметить выполненной
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleMarkCancelled}
                    disabled={goal.status === 'cancelled'}
                  >
                    Отменить
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </header>

      {/* Галерея */}
      {goal.images && goal.images.length > 0 && (
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {goal.images.map((filename) => (
              <button
                key={filename}
                type="button"
                className="aspect-video rounded-lg overflow-hidden border bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                onClick={() => setImageModalUrl(getImageUrlForGoal(filename))}
              >
                <img
                  src={getImageUrlForGoal(filename)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Модалка изображения */}
      <Dialog open={!!imageModalUrl} onOpenChange={(open) => !open && setImageModalUrl(null)}>
        <DialogContent
          className="max-w-[100vw] w-full h-full max-h-[100vh] rounded-none border-0 p-0 bg-black/95"
          showCloseButton={true}
        >
          {imageModalUrl && (
            <img
              src={imageModalUrl}
              alt=""
              className="w-full h-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Описание */}
      {goal.description && (
        <section>
          <p className="text-foreground whitespace-pre-wrap">{goal.description}</p>
        </section>
      )}

      {/* Прогресс подзадач */}
      {totalSubtasks > 0 && (
        <section className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {completedSubtasks}/{totalSubtasks} шагов
            </span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-[width] duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </section>
      )}

      {/* Список подзадач */}
      {totalSubtasks > 0 && (
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Подзадачи</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {subtasks.map((subtask) => (
                <label
                  key={subtask.id}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer',
                    !isOwner && 'cursor-default'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={subtask.is_completed}
                    onChange={() =>
                      isOwner &&
                      toggleSubtask.mutate({
                        subtaskId: subtask.id,
                        isCompleted: !subtask.is_completed,
                      })
                    }
                    disabled={!isOwner}
                    className="size-4 rounded border-input"
                  />
                  <span
                    className={cn(
                      'flex-1',
                      subtask.is_completed && 'line-through text-muted-foreground'
                    )}
                  >
                    {subtask.title}
                  </span>
                  {subtask.target_date && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(subtask.target_date).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                </label>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Дневник прогресса */}
      <section>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Дневник прогресса</CardTitle>
            {isOwner && (
              <Button variant="outline" size="sm" disabled>
                Добавить запись
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-6">
              Записей пока нет
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Комментарии */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Комментарии</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground text-center">
              Форма комментария (скоро)
            </div>
            <p className="text-sm text-muted-foreground text-center py-4">
              Список комментариев (скоро)
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Итог при completed/cancelled */}
      {(goal.status === 'completed' || goal.status === 'cancelled') &&
        (goal.status_comment || goal.status_image) && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Итог</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {goal.status_comment && (
                  <p className="text-foreground whitespace-pre-wrap">
                    {goal.status_comment}
                  </p>
                )}
                {goal.status_image && (
                  <div className="rounded-lg overflow-hidden border">
                    <img
                      src={getImageUrlForGoal(goal.status_image)}
                      alt="Итог"
                      className="w-full max-h-80 object-cover"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}
    </div>
  );
}
