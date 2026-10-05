import React, { createContext, useContext, useState, useEffect } from 'react';
import type { LoginRequest } from '../types';
import { authApi, tokenStorage } from '../api/client';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(tokenStorage.get());

  useEffect(() => {
    // Keep state in sync with localStorage
    const storedToken = tokenStorage.get();
    setToken(storedToken);
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    const res = await authApi.login(credentials);
    setToken(res.token);
  };

  const logout = (): void => {
    authApi.logout();
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
