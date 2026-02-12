import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/features/auth';
import { Layout } from './components/common/Layout';
import { ProtectedRoute } from '@/features/auth';
import {
  HomePage,
  LoginPage,
  RegisterPage,
  GoalPage,
  ProfilePage,
  SettingsPage,
  NewGoalPage,
} from './pages';
import './App.css';

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/goals/new"
          element={
            <ProtectedRoute>
              <NewGoalPage />
            </ProtectedRoute>
          }
        />
        <Route path="/goals/:id" element={<GoalPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
