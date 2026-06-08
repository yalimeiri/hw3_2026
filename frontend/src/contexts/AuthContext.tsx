import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { setAuthToken } from '../utils/api';

interface AuthUser {
  token: string;
  username: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (nextUser: AuthUser) => {
    setUser(nextUser);
    setAuthToken(nextUser.token);
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isLoggedIn: user !== null,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
