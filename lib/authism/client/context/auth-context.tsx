"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginResult } from '../../shared/types';
import { loginAction, logoutAction } from '../../server/actions/auth';
import { verifyToken } from '../../server/core/tokens';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isUser: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<boolean>;
  refreshUser: () => Promise<User | null>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialCheckDone, setInitialCheckDone] = useState<boolean>(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    if (loading) return user;
    
    setLoading(true);
    
    try {
      const userData = await getUserClient();
      if (userData) {
        setUser(userData);
      }
      return userData || null;
    } catch (error) {
      console.error("Error refreshing user:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loading, user]);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await loginAction(email, password);
      
      if (result.success) {
        setUser(result.user || null);
      } else {
        setError(result.error || "Login failed");
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during login";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    
    try {
      const result = await logoutAction();
      
      if (result.success) {
        setUser(null);
      }
      
      return result.success;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial auth check on mount
  useEffect(() => {
    if (!initialCheckDone) {
      refreshUser().then(() => {
        setInitialCheckDone(true);
      });
    }
  }, [initialCheckDone, refreshUser]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    login,
    logout,
    refreshUser,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 

async function getUserClient() {
  const token = getCookie("session")
  if (!token) return null;
  const session = await verifyToken(token);
  return session?.user || null;
}

function getCookie(name: string) {
  if (typeof document === "undefined") return

  const value = "; " + document.cookie
  const decodedValue = decodeURIComponent(value)
  const parts = decodedValue.split("; " + name + "=")

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift()
  }
}