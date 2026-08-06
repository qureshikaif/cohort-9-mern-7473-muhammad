import { useCallback, useMemo, useState, type ReactNode } from 'react';
import * as api from '../lib/api';
import type { User } from '../lib/types';
import { AuthContext } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => api.readSession()?.user ?? null);

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await api.login(email, password);
    api.writeSession(session);
    setUser(session.user);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const session = await api.register(name, email, password);
    api.writeSession(session);
    setUser(session.user);
  }, []);

  const signOut = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, signIn, signUp, signOut }), [user, signIn, signUp, signOut]);

  return <AuthContext value={value}>{children}</AuthContext>;
}
