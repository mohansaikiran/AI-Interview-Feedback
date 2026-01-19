/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth.api';
import { hasInterviewHistory } from '../api/interviews.api';

type AuthUser = { userId: string; email: string };

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  hasCompletedInterview: boolean | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedInterview, setHasCompletedInterview] = useState<boolean | null>(null);

  async function hydrate() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        setUser(null);
        setHasCompletedInterview(null);
        setIsLoading(false);
        return;
    }

    try {
        const me = await authApi.me();
        setUser(me);

        // Check if interview already exists
        setHasCompletedInterview(await hasInterviewHistory());
    } catch {
        localStorage.removeItem('accessToken');
        setUser(null);
        setHasCompletedInterview(null);
    } finally {
        setIsLoading(false);
    }
    }

  useEffect(() => {
    hydrate();
  }, []);

  async function login(email: string, password: string) {
    const { accessToken } = await authApi.login(email, password);
    localStorage.setItem('accessToken', accessToken);
    const me = await authApi.me();
    setUser(me);
    setHasCompletedInterview(await hasInterviewHistory());

  }

  async function register(email: string, password: string) {
    const { accessToken } = await authApi.register(email, password);
    localStorage.setItem('accessToken', accessToken);
    const me = await authApi.me();
    setUser(me);
    setHasCompletedInterview(await hasInterviewHistory());
  }

  function logout() {
    localStorage.removeItem('accessToken');
    setUser(null);
    setHasCompletedInterview(null);
  }

  const value = useMemo(
    () => ({ user, isLoading, hasCompletedInterview, login, register, logout }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}