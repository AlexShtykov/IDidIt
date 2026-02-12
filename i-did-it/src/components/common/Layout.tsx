import { Outlet, Link } from 'react-router-dom';
import { Target, LogIn } from 'lucide-react';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-semibold text-lg text-gray-900 hover:text-gray-700">
              <Target className="h-6 w-6 text-emerald-600" aria-hidden />
              I Did It!
            </Link>
            <nav className="flex items-center gap-6">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Главная
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <LogIn className="h-4 w-4" aria-hidden />
                Войти
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
