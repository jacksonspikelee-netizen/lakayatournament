import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { apiRequest, setAuthToken, clearAuthToken, getAuthToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email_or_username: string; password: string }) => Promise<void>;
  googleLogin: (email?: string, name?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isMembershipModalOpen: boolean;
  setIsMembershipModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  requireMembership: (callback?: () => void) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const refreshUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await apiRequest<User>('/auth/me');
      setUser(me);
    } catch {
      clearAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Online Heartbeat
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      apiRequest('/presence/heartbeat', { method: 'POST' }).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const login = async (credentials: { email_or_username: string; password: string }) => {
    const res = await apiRequest<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setAuthToken(res.token);
    await refreshUser();
    setIsAuthModalOpen(false);
  };

  const googleLogin = async (email?: string, name?: string) => {
    const res = await apiRequest<{ token: string; user: User }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
    setAuthToken(res.token);
    await refreshUser();
    setIsAuthModalOpen(false);
  };

  const register = async (data: any) => {
    const res = await apiRequest<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(res.token);
    await refreshUser();
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    clearAuthToken();
    setUser(null);
  };

  const requireMembership = (callback?: () => void): boolean => {
    if (!user) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return false;
    }
    if (!user.is_member_active && user.role !== 'admin') {
      setIsMembershipModalOpen(true);
      return false;
    }
    if (callback) callback();
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        googleLogin,
        register,
        logout,
        refreshUser,
        isMembershipModalOpen,
        setIsMembershipModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        requireMembership,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
