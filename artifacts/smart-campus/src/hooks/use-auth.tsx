import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { User, AuthResponse } from '@workspace/api-client-react';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) return null;
      const user = JSON.parse(savedUser);
      // Ensure role is lowercase for consistency
      if (user && user.role) user.role = user.role.toLowerCase();
      return user;
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });
  
  const [, setLocation] = useLocation();

  // Sync state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        setToken(e.newValue);
        if (!e.newValue) {
          setUser(null);
          setLocation('/');
        }
      }
      if (e.key === 'user') {
        try {
          const user = e.newValue ? JSON.parse(e.newValue) : null;
          if (user && user.role) user.role = user.role.toLowerCase();
          setUser(user);
        } catch {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setLocation]);

  const login = (authData: AuthResponse, redirectPath = '/dashboard') => {
    const user = { ...authData.user, role: authData.user.role.toLowerCase() };
    setUser(user);
    setToken(authData.token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', authData.token);
    if (redirectPath) {
      setLocation(redirectPath);
    }
  };

  const logout = (redirectPath = '/') => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    if (redirectPath) {
      setLocation(redirectPath);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token && !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
