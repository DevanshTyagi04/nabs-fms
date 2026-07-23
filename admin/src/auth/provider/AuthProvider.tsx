'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthStatus, UserRole } from '@packages/shared-types';
import { AuthUser } from '@nabs/sdk';
import { SessionManager } from '../services/SessionManager';

interface AuthContextType {
  status: AuthStatus;
  user: AuthUser | null;
  role: UserRole | null;
  permissions: string[];
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getPermissionsForRole(role?: UserRole | null): string[] {
  if (role === 'ADMIN') return ['*'];
  if (role === 'VENDOR') return ['vendor:read', 'vendor:write', 'job:accept', 'job:update'];
  if (role === 'CUSTOMER') return ['customer:read', 'request:create', 'request:read', 'payment:initiate'];
  return [];
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('initializing');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const restoreSession = useCallback(async () => {
    setStatus('initializing');
    setError(null);
    try {
      const authUser = await SessionManager.restoreSession();
      if (authUser) {
        setUser(authUser);
        setStatus('authenticated');
      } else {
        setUser(null);
        setStatus('unauthenticated');
      }
    } catch (err: any) {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (credentials: { email: string; password: string }) => {
    setError(null);
    try {
      const { user: authUser } = await SessionManager.login(credentials);
      setUser(authUser);
      setStatus('authenticated');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      setStatus('unauthenticated');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await SessionManager.logout();
    } finally {
      setUser(null);
      setStatus('unauthenticated');
    }
  };

  const role = user?.role || null;
  const permissions = getPermissionsForRole(role);

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        role,
        permissions,
        login,
        logout,
        restoreSession,
        error,
      }}
    >
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
