import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { pb, getPbErrorMessage } from '@/lib/pocketbase';
import type { User } from './types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, data?: Record<string, unknown>) => Promise<void>;
  signOut: () => void;
  signInWithOAuth: (provider: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function syncUserFromStore(): User | null {
  const model = pb.authStore.model;
  if (!model || !pb.authStore.isValid) return null;
  return model as User;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => syncUserFromStore());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(syncUserFromStore());
    setIsLoading(false);

    const unsubscribe = pb.authStore.onChange(() => {
      setUser(syncUserFromStore());
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await pb.collection('users').authWithPassword(email, password);
    setUser(pb.authStore.model as User);
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, data?: Record<string, unknown>) => {
      try {
        await pb.collection('users').create({
          ...data,
          email,
          password,
          passwordConfirm: (data?.passwordConfirm as string) ?? password,
        });
        await pb.collection('users').authWithPassword(email, password);
        setUser(pb.authStore.model as User);
      } catch (err: unknown) {
        throw new Error(getPbErrorMessage(err, ['email', 'username', 'password']));
      }
    },
    []
  );

  const signOut = useCallback(() => {
    pb.authStore.clear();
    setUser(null);
  }, []);

  const signInWithOAuth = useCallback(async (provider: string) => {
    await pb.collection('users').authWithOAuth2({ provider });
    setUser(pb.authStore.model as User);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      signIn,
      signUp,
      signOut,
      signInWithOAuth,
    }),
    [user, isLoading, signIn, signUp, signOut, signInWithOAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
}
