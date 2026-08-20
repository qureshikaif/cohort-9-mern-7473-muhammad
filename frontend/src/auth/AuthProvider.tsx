import { useState, type ReactNode } from 'react';
import * as api from '../lib/api';
import type { User } from '../lib/types';
import { AuthContext } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => api.readSession()?.user ?? null);

  async function signIn(email: string, password: string) {
    const session = await api.login(email, password);
    api.writeSession(session);
    setUser(session.user);
  }

  async function signUp(name: string, email: string, password: string) {
    const session = await api.register(name, email, password);
    api.writeSession(session);
    setUser(session.user);
  }

  async function signOut() {
    try {
      await api.logout();
    } catch {
      // ignore
    }

    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
  );
}
