import { useParams, Link } from 'react-router-dom';
import { pb } from '@/lib/pocketbase';
import { useProfile } from '@/features/profile';
import { useAuthContext } from '@/features/auth';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import type { Profile } from '@/types/profile';
import { cn } from '@/lib/utils';

function getAvatarUrl(user: Profile): string | null {
  if (!user.avatar) return null;
  return pb.files.getUrl(user, user.avatar);
}

function displayName(user: Profile): string {
  const hasName = user.first_name || user.last_name;
  return hasName ? [user.first_name, user.last_name].filter(Boolean).join(' ') : user.username;
}

function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
        <div className="rounded-full size-[120px] bg-muted animate-pulse shrink-0" />
        <div className="flex-1 min-w-0 space-y-3">
          <div className="h-7 w-48 bg-muted rounded animate-pulse" />
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-full max-w-sm bg-muted rounded animate-pulse" />
          <div className="flex flex-wrap gap-4 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-5 w-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
          <div className="h-9 w-28 bg-muted rounded animate-pulse pt-2" />
        </div>
      </div>
      <div className="mt-8 space-y-4">
        <div className="flex gap-2 border-b">
          <div className="h-9 w-20 bg-muted rounded animate-pulse" />
          <div className="h-9 w-24 bg-muted rounded animate-pulse" />
          <div className="h-9 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-32 bg-muted rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

function NotFoundProfile() {
  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 text-center">
      <h1 className="text-2xl font-bold text-foreground">Профиль не найден</h1>
      <p className="mt-2 text-muted-foreground">Пользователь с таким именем не существует или страница удалена.</p>
      <Button asChild variant="outline" className="mt-6">
        <Link to="/">На главную</Link>
      </Button>
    </div>
  );
}

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthContext();
  const { data: user, isLoading, isError } = useProfile(username ?? '');

  if (!username) {
    return <NotFoundProfile />;
  }

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !user) {
    return <NotFoundProfile />;
  }

  const avatarUrl = getAvatarUrl(user);
  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-3xl">
      {/* Шапка профиля */}
      <header className="flex flex-col sm:flex-row sm:items-start gap-6">
        <Avatar
          className={cn(
            'size-[120px] shrink-0 border-4 border-background shadow-md',
            'ring-1 ring-border'
          )}
        >
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={user.username} className="object-cover" />
          ) : null}
          <AvatarFallback className="text-3xl bg-muted text-muted-foreground">
            {(user.first_name?.[0] ?? user.username[0] ?? '?').toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
            {displayName(user)}
          </h1>
          <p className="text-muted-foreground truncate">@{user.username}</p>
          {user.bio ? (
            <p className="mt-2 text-sm text-foreground/90 whitespace-pre-wrap break-words">
              {user.bio}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
            <span>{user.goals_count} целей</span>
            <span>{user.completed_goals_count} достигнуто</span>
            <span>{user.followers_count} подписчиков</span>
            <span>{user.following_count} подписок</span>
          </div>

          <div className="mt-4">
            {isOwnProfile ? (
              <Button asChild variant="outline" size="sm">
                <Link to="/settings">Редактировать</Link>
              </Button>
            ) : (
              <Button variant="default" size="sm" disabled>
                Подписаться
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Табы */}
      <Tabs defaultValue="goals" className="mt-8">
        <TabsList className="w-full sm:w-auto flex flex-wrap h-auto gap-1 p-1" variant="line">
          <TabsTrigger value="goals">Цели</TabsTrigger>
          <TabsTrigger value="completed">Достигнуто</TabsTrigger>
          <TabsTrigger value="badges">Бейджи</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="mt-6">
          <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground text-sm">
            Список целей пользователя (скоро)
          </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground text-sm">
            Выполненные цели (скоро)
          </div>
        </TabsContent>
        <TabsContent value="badges" className="mt-6">
          <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground text-sm">
            Значки достижений (скоро)
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
