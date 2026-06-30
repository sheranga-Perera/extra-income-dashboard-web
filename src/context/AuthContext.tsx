import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loginUser, registerUser, type RegisterPayload } from '../api/auth';
import { setAuthToken, setUnauthorizedHandler } from '../api/http';

export interface UserSummary {
  username: string;
  role: 'ADMIN';
}

interface AuthContextValue {
  user: UserSummary | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'auth_token';
const USERNAME_KEY = 'admin_username';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem(STORAGE_KEY);
    setAuthToken(storedToken);
    return storedToken;
  });
  const [user, setUser] = useState<UserSummary | null>(() => {
    const storedUsername = localStorage.getItem(USERNAME_KEY);
    return token && storedUsername ? { username: storedUsername, role: 'ADMIN' } : null;
  });

  const login = useCallback(async (username: string, password: string) => {
    const newToken = await loginUser(username, password);
    localStorage.setItem(STORAGE_KEY, newToken);
    localStorage.setItem(USERNAME_KEY, username);
    setToken(newToken);
    setAuthToken(newToken);
    setUser({ username, role: 'ADMIN' });
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const newToken = await registerUser(payload);
    localStorage.setItem(STORAGE_KEY, newToken);
    localStorage.setItem(USERNAME_KEY, payload.username);
    setToken(newToken);
    setAuthToken(newToken);
    setUser({ username: payload.username, role: 'ADMIN' });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USERNAME_KEY);
    setToken(null);
    setUser(null);
    setAuthToken(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    login,
    register,
    logout
  }), [user, token, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
