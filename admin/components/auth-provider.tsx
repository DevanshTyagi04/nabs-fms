'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/auth-storage';
import { authApi } from '@/lib/auth-api';
import { LoginFormData } from '@/lib/schemas/auth.schema';
import { User } from '@/lib/types/auth.types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginFormData) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Validate session on mount
  useEffect(() => {
    async function initAuth() {
      const storedToken = authStorage.getAccessToken();
      const storedUser = authStorage.getUser();

      if (storedToken) {
        if (storedUser) {
          setUser(storedUser);
        }
        try {
          const data = await authApi.getMe();
          setUser(data.user);
          authStorage.setUser(data.user);
        } catch {
          // If token verification fails and refresh fails, clear storage
          authStorage.clearAll();
          setUser(null);
        }
      }
      setIsLoading(false);
    }

    initAuth();
  }, []);

  const login = async (credentials: LoginFormData): Promise<User> => {
    const data = await authApi.login(credentials);
    authStorage.setTokens(data.tokens);
    authStorage.setUser(data.user);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    const refreshToken = authStorage.getRefreshToken() || undefined;
    try {
      await authApi.logout(refreshToken);
    } catch {
      // Ignore logout backend errors and clear local state regardless
    } finally {
      authStorage.clearAll();
      setUser(null);
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
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
