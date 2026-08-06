import { createContext, use } from 'react';
import type { User } from '../lib/types';

export interface AuthValue {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Kept out of AuthProvider.tsx so that file only exports a component, which is
// what Fast Refresh needs to hot-reload it.
export const AuthContext = createContext<AuthValue | null>(null);

export function useAuth(): AuthValue {
  const value = use(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return value;
}
