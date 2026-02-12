import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, User, Bell, Settings } from 'lucide-react';
import { pb, getPbErrorMessage } from '@/lib/pocketbase';
import { useAuth } from '@/features/auth';
import { getAvatarUrl } from '@/features/auth/getAvatarUrl';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import type { User as UserType } from '@/features/auth/types';

const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'От 3 до 30 символов')
    .max(30, 'От 3 до 30 символов')
    .regex(/^[a-zA-Z0-9_]+$/, 'Только буквы, цифры и подчёркивание'),
  first_name: z.string().max(100).optional().or(z.literal('')),
  last_name: z.string().max(100).optional().or(z.literal('')),
  bio: z.string().max(500, 'Максимум 500 символов').optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type SettingsSection = 'profile' | 'account' | 'notifications';

const navItems: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Профиль', icon: User },
  { id: 'account', label: 'Аккаунт', icon: Settings },
  { id: 'notifications', label: 'Уведомления', icon: Bell },
];

export function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username ?? '',
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      bio: user?.bio ?? '',
    },
  });

  const currentAvatarUrl = avatarPreview ?? (user ? getAvatarUrl(user) : null);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    e.target.value = '';
  };

  const handleRemoveAvatar = async () => {
    if (!user?.id) return;
    setIsDeletingAvatar(true);
    try {
      await pb.collection('users').update(user.id, { avatar: null });
      setAvatarFile(null);
      setAvatarPreview(null);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      const updated = await pb.collection('users').getOne<UserType>(user.id);
      pb.authStore.save(pb.authStore.token, updated);
      queryClient.invalidateQueries({ queryKey: ['profile', user.username] });
      toast.success('Аватар удалён');
    } catch {
      toast.error('Не удалось удалить аватар');
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user?.id) return;

    const newUsername = (data.username ?? '').trim();
    if (newUsername !== (user.username ?? '')) {
      const existing = await pb.collection('users').getList(1, 1, {
        filter: `username = "${newUsername}" && id != "${user.id}"`,
      });
      if (existing.totalItems > 0) {
        form.setError('username', { message: 'Этот никнейм уже занят' });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('username', data.username);
      formData.append('first_name', data.first_name ?? '');
      formData.append('last_name', data.last_name ?? '');
      formData.append('bio', data.bio ?? '');
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      await pb.collection('users').update(user.id, formData);

      const updated = await pb.collection('users').getOne<UserType>(user.id);
      pb.authStore.save(pb.authStore.token, updated);

      setAvatarFile(null);
      setAvatarPreview(null);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);

      form.reset({
        username: updated.username,
        first_name: updated.first_name ?? '',
        last_name: updated.last_name ?? '',
        bio: updated.bio ?? '',
      });

      queryClient.invalidateQueries({ queryKey: ['profile', user.username] });
      queryClient.invalidateQueries({ queryKey: ['profile', updated.username] });

      toast.success('Изменения сохранены');
    } catch (err: unknown) {
      if (import.meta.env.DEV) {
        const e = err as { status?: number; response?: unknown };
        console.error('Ошибка обновления профиля:', e?.status, e?.response ?? err);
      }
      toast.error(getPbErrorMessage(err, ['username', 'avatar', 'first_name', 'last_name', 'bio']));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Настройки</h1>

      <div className="flex flex-col sm:flex-row gap-8">
        {/* Боковое меню */}
        <nav className="sm:w-48 shrink-0 border-b sm:border-b-0 sm:border-r border-border pb-4 sm:pb-0 sm:pr-6">
          <ul className="flex sm:flex-col gap-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setActiveSection(id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm font-medium transition-colors',
                    activeSection === id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Контент */}
        <div className="flex-1 min-w-0">
          {activeSection === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Профиль</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Аватар */}
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="relative group shrink-0">
                    <Avatar className="size-24 border-2 border-border">
                      {currentAvatarUrl ? (
                        <AvatarImage src={currentAvatarUrl} alt={user.username} className="object-cover" />
                      ) : null}
                      <AvatarFallback className="text-2xl bg-muted text-muted-foreground">
                        {(user.first_name?.[0] ?? user.username?.[0] ?? '?').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      aria-hidden
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleAvatarClick}>
                      Изменить
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      disabled={isDeletingAvatar || (!user.avatar && !avatarFile)}
                    >
                      {isDeletingAvatar ? <Loader2 className="size-4 animate-spin" /> : 'Удалить аватар'}
                    </Button>
                  </div>
                </div>

                {/* Форма */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Никнейм</FormLabel>
                          <FormControl>
                            <Input placeholder="username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Имя</FormLabel>
                          <FormControl>
                            <Input placeholder="Имя" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Фамилия</FormLabel>
                          <FormControl>
                            <Input placeholder="Фамилия" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>О себе</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Кратко о себе (макс. 500 символов)"
                              rows={4}
                              maxLength={500}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : 'Сохранить изменения'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {activeSection === 'account' && (
            <Card>
              <CardHeader>
                <CardTitle>Аккаунт</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Раздел в разработке.</p>
              </CardContent>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Уведомления</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Раздел в разработке.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
