import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, AuthenticationResponse } from '@/services/api';
import { tokenStorage, StoredUser } from '@/lib/tokenStorage';

interface AuthContextType {
  isAuthenticated: boolean;
  user: StoredUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    phoneNumber: string;
    role: 'ADMIN' | 'MANAGER' | 'FRONT_DESK' | 'TECHNICIAN' | 'CUSTOMER';
  }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on component mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setLoading(true);
    try {
      if (tokenStorage.hasValidSession()) {
        const storedUser = tokenStorage.getUser();
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
          
          // Try to refresh user data from server
          try {
            await refreshUser();
          } catch (error) {
            // If refresh fails, keep the stored user data
            console.warn('Failed to refresh user data:', error);
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      tokenStorage.clearSession();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response: AuthenticationResponse = await apiService.login({ email, password });
      
      const userData: StoredUser = {
        email: response.email,
        name: response.name,
        phoneNumber: response.phoneNumber,
        role: response.role,
        lastVisit: response.lastVisit,
      };

      // Store session with 1 hour expiry
      tokenStorage.storeSession(response.access_token, response.token_type, userData, 3600);
      
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    phoneNumber: string;
    role: 'ADMIN' | 'MANAGER' | 'FRONT_DESK' | 'TECHNICIAN' | 'CUSTOMER';
  }): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response: AuthenticationResponse = await apiService.register(userData);
      
      const storedUserData: StoredUser = {
        email: response.email,
        name: response.name,
        phoneNumber: response.phoneNumber,
        role: response.role,
        lastVisit: response.lastVisit,
      };

      // Store session with 1 hour expiry
      tokenStorage.storeSession(response.access_token, response.token_type, storedUserData, 3600);
      
      setUser(storedUserData);
      setIsAuthenticated(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (!tokenStorage.hasValidSession()) {
        throw new Error('No valid session');
      }

      const response: AuthenticationResponse = await apiService.getCurrentUser();
      
      const userData: StoredUser = {
        email: response.email,
        name: response.name,
        phoneNumber: response.phoneNumber,
        role: response.role,
        lastVisit: response.lastVisit,
      };

      tokenStorage.updateUserData(userData);
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // Don't throw here - let the app continue with cached data
    }
  };

  const logout = (): void => {
    tokenStorage.clearSession();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    loading,
    error,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};