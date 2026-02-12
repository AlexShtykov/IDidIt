import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Target,
  Search,
  LogIn,
  UserPlus,
  Plus,
  Bell,
  User,
  ListTodo,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { getAvatarUrl } from '@/features/auth/getAvatarUrl';
import type { User } from '@/features/auth/types';
import {
  Button,
  Input,
  Avatar,
  AvatarImage,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui';
import { cn } from '@/lib/utils';

function getInitials(user: User): string {
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }
  if (user.username?.length >= 2) {
    return user.username.slice(0, 2).toUpperCase();
  }
  return user.username?.[0]?.toUpperCase() ?? '?';
}

export function Header() {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = () => {
    signOut();
    setMobileOpen(false);
    navigate('/');
  };

  const searchPlaceholder = 'Поиск...';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 transition-shadow',
        scrolled && 'shadow-md'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 font-semibold text-lg text-gray-900 hover:text-gray-700"
            onClick={() => setMobileOpen(false)}
          >
            <Target className="h-6 w-6 text-emerald-600" aria-hidden />
            <span className="hidden sm:inline">I Did It!</span>
          </Link>

          {/* Search — desktop center */}
          <div className="hidden flex-1 max-w-md mx-auto md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                className="pl-9 bg-muted/50"
                readOnly
                aria-label="Поиск"
              />
            </div>
          </div>

          {/* Desktop: right block */}
          <div className="hidden md:flex items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login" className="gap-2">
                    <LogIn className="h-4 w-4" aria-hidden />
                    Войти
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <UserPlus className="h-4 w-4" aria-hidden />
                    Регистрация
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/goals/new" className="gap-2">
                    <Plus className="h-4 w-4" aria-hidden />
                    Создать цель
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" aria-label="Уведомления (заглушка)">
                  <Bell className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                      aria-label="Меню пользователя"
                    >
                      <Avatar size="sm" className="h-8 w-8 border-2 border-white shadow">
                        {user && getAvatarUrl(user) ? (
                          <AvatarImage src={getAvatarUrl(user)!} alt={user.username} />
                        ) : null}
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                          {user ? getInitials(user) : '?'}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to={user ? `/profile/${user.username}` : '/'} className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Мой профиль
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/goals" className="flex items-center gap-2">
                        <ListTodo className="h-4 w-4" />
                        Мои цели
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Настройки
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4" />
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile: search + burger */}
          <div className="flex md:hidden items-center gap-2 flex-1 justify-end">
            <div className="relative flex-1 max-w-[140px] sm:max-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                className="pl-8 h-8 text-sm bg-muted/50"
                readOnly
                aria-label="Поиск"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-white md:hidden">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            <div className="md:hidden max-w-full mb-2">
              <Input
                type="search"
                placeholder={searchPlaceholder}
                className="bg-muted/50"
                readOnly
                aria-label="Поиск"
              />
            </div>
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" className="justify-start gap-2" asChild>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <LogIn className="h-4 w-4" />
                    Войти
                  </Link>
                </Button>
                <Button className="justify-start gap-2 bg-emerald-600 hover:bg-emerald-700" asChild>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    <UserPlus className="h-4 w-4" />
                    Регистрация
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="justify-start gap-2" asChild>
                  <Link to="/goals/new" onClick={() => setMobileOpen(false)}>
                    <Plus className="h-4 w-4" />
                    Создать цель
                  </Link>
                </Button>
                <Button variant="ghost" className="justify-start gap-2" aria-label="Уведомления (заглушка)">
                  <Bell className="h-4 w-4" />
                  Уведомления
                </Button>
                <div className="my-2 border-t" />
                <Button variant="ghost" className="justify-start gap-2" asChild>
                  <Link to={user ? `/profile/${user.username}` : '/'} onClick={() => setMobileOpen(false)}>
                    <User className="h-4 w-4" />
                    Мой профиль
                  </Link>
                </Button>
                <Button variant="ghost" className="justify-start gap-2" asChild>
                  <Link to="/goals" onClick={() => setMobileOpen(false)}>
                    <ListTodo className="h-4 w-4" />
                    Мои цели
                  </Link>
                </Button>
                <Button variant="ghost" className="justify-start gap-2" asChild>
                  <Link to="/settings" onClick={() => setMobileOpen(false)}>
                    <Settings className="h-4 w-4" />
                    Настройки
                  </Link>
                </Button>
                <div className="my-2 border-t" />
                <Button variant="ghost" className="justify-start gap-2 text-destructive" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Выйти
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
