import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiService } from '../services/api';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = ApiService.getUser();
      const token = ApiService.getToken();
      
      if (storedUser && token) {
        setUser(storedUser);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (token: string, userData: any) => {
    ApiService.saveToken(token);
    ApiService.saveUser(userData);
    setUser(userData);
  };

  const logout = () => {
    ApiService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
