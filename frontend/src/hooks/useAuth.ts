import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { KeyManager } from '../utils/encryption';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  encryptionKey: CryptoKey | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setEncryptionKey: (key: CryptoKey) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token on mount
    const token = localStorage.getItem('auth_token');
    const userJson = localStorage.getItem('user');

    if (token && userJson) {
      try {
        setUser(JSON.parse(userJson));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.login(email, password);

      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);

      // Derive encryption key from password
      const key = await KeyManager.getKeyForUser(response.user.id, password);
      setEncryptionKey(key);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.register(email, password);

      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);

      // Initialize encryption for new user
      const key = await KeyManager.initializeForUser(response.user.id, password);
      setEncryptionKey(key);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (user) {
      KeyManager.clearUserData(user.id);
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    setEncryptionKey(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    encryptionKey,
    login,
    register,
    logout,
    setEncryptionKey,
  };
};

export { AuthContext };
