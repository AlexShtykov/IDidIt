import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuthContext } from '@/features/auth';
import { useGoals } from '@/features/goals';
import { Badge, Button, Card, CardHeader } from '@/components/ui';
import type { Goal } from '@/types/goal';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<Goal['status'], string> = {
  active: 'В процессе',
  completed: 'Достигнуто',
  cancelled: 'Отменена',
};

const STATUS_BADGE_CLASS: Record<Goal['status'], string> = {
  active: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

function GoalsListSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 rounded-lg border bg-card animate-pulse" />
      ))}
    </div>
  );
}

export function GoalsPage() {
  const { user } = useAuthContext();
  const { data, isLoading, isError, error } = useGoals({
    userId: user?.id,
    limit: 50,
  });

  if (!user) {
    return null; // ProtectedRoute перенаправит на логин
  }

  if (isLoading) {
    return <GoalsListSkeleton />;
  }

  const goals = data?.items ?? [];
  const total = data?.totalItems ?? 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Мои цели</h1>
        <Button asChild>
          <Link to="/goals/new">Создать цель</Link>
        </Button>
      </div>

      {isError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
          <p>Не удалось загрузить цели.</p>
          {error instanceof Error && (
            <p className="mt-2 text-sm opacity-90">{error.message}</p>
          )}
          <p className="mt-2 text-sm">Проверьте, что PocketBase запущен и в коллекции goals включены API Rules: List и View (можно оставить пустыми для доступа всем).</p>
        </div>
      ) : total === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          <p className="mb-4">У вас пока нет целей.</p>
          <Button asChild>
            <Link to="/goals/new">Создать первую цель</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {goals.map((goal) => (
            <li key={goal.id}>
              <Link to={`/goals/${goal.id}`} className="block">
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader className="flex flex-row items-start justify-between gap-2 py-4">
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold text-foreground truncate">
                        {goal.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Создано{' '}
                        {formatDistanceToNow(goal.created, {
                          addSuffix: true,
                          locale: ru,
                        })}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'shrink-0',
                        STATUS_BADGE_CLASS[goal.status]
                      )}
                    >
                      {STATUS_LABELS[goal.status]}
                    </Badge>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
