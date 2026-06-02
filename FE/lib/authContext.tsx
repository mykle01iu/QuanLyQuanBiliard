'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from './types';
import { apiRequest } from './api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeBEUserRole = (role: string): User['role'] => {
  if (role === 'admin') return 'admin';
  if (role === 'cashier' || role === 'accountant' || role === 'manager' || role === 'employee') {
    return role as User['role'];
  }
  return 'employee';
};

const mapBEUser = (beUser: any): User => {
  return {
    id: String(beUser.id),
    name: beUser.fullname || beUser.username,
    email: beUser.username.includes('@') ? beUser.username : `${beUser.username}@99billiards.com`,
    phone: beUser.phone || '',
    role: normalizeBEUserRole(beUser.role),
    salary: beUser.role === 'admin' ? 50000 : 30000,
    createdAt: beUser.createdAt ? new Date(beUser.createdAt) : new Date(),
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage or fetch /me on mount
  useEffect(() => {
    async function loadUser() {
      const storedUser = localStorage.getItem('currentUser');
      const token = localStorage.getItem('auth_token');

      if (token) {
        try {
          const beUser = await apiRequest('/auth/me');
          const mapped = mapBEUser(beUser);
          setUser(mapped);
          localStorage.setItem('currentUser', JSON.stringify(mapped));
        } catch (error) {
          console.error('Failed to fetch /me, falling back to local storage', error);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            localStorage.removeItem('auth_token');
          }
        }
      } else if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    const username = emailOrUsername.endsWith('@99billiards.com')
      ? emailOrUsername.replace('@99billiards.com', '')
      : emailOrUsername;

    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (data.token && data.user) {
      localStorage.setItem('auth_token', data.token);
      const mapped = mapBEUser(data.user);
      setUser(mapped);
      localStorage.setItem('currentUser', JSON.stringify(mapped));
    } else {
      throw new Error('Đăng nhập thất bại: Phản hồi không hợp lệ');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('auth_token');
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role !== 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
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
