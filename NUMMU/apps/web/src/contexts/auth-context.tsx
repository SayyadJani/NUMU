'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService, type LoginPayload, type RegisterPayload } from '@/services/auth.service';
import { clearProfileCache } from '@/services/profile-service';
import type { User } from '@numu/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
    } catch {
      // Not authenticated or session expired
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (payload: LoginPayload): Promise<User> => {
      clearProfileCache();
      const response = await authService.login(payload);
      setUser(response.user);
      return response.user;
    },
    [],
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<User> => {
      clearProfileCache();
      const response = await authService.register(payload);
      setUser(response.user);
      return response.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      clearProfileCache();
      await authService.logout();
    } catch (err) {
      console.warn('Logout API call failed, clearing local session state', err);
    } finally {
      clearProfileCache();
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, []);

  const logoutAll = useCallback(async () => {
    try {
      clearProfileCache();
      await authService.logoutAll();
    } catch (err) {
      console.warn('Logout all API call failed, clearing local session state', err);
    } finally {
      clearProfileCache();
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, []);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      logoutAll,
      refreshUser,
    }),
    [user, loading, login, register, logout, logoutAll, refreshUser],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
