import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type AuthUser } from '@shared/auth';
import { initializeApiClient } from '@shared/apiClient';

interface AuthContextType {
  isAuthenticated: boolean;
  hasBetaAccess: boolean;
  user: AuthUser | null;
  login: (password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasBetaAccess, setHasBetaAccess] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check for beta password auth (browse access)
        const betaAuthStatus = localStorage.getItem('stutor:beta-auth');
        if (betaAuthStatus === 'authenticated') {
          setHasBetaAccess(true);
        }
        
        // Check for Google OAuth user (upload permissions)
        const userData = localStorage.getItem('stutor:user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }

        // Initialize API client with user ID getter
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        initializeApiClient(() => {
          const userData = localStorage.getItem('stutor:user');
          return userData ? JSON.parse(userData).id : null;
        }, apiBaseUrl);
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Get the expected password from environment variable
      const expectedPassword = import.meta.env.VITE_BETA_ACCESS_PASSWORD;
      
      if (!expectedPassword) {
        console.error('Beta access password not configured');
        return false;
      }
      
      if (password === expectedPassword) {
        localStorage.setItem('stutor:beta-auth', 'authenticated');
        setHasBetaAccess(true);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      // Get API base URL
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      
      // Redirect to Google OAuth
      window.location.href = `${apiBaseUrl}/api/auth/google`;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('stutor:beta-auth');
      localStorage.removeItem('stutor:user');
      setIsAuthenticated(false);
      setHasBetaAccess(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    hasBetaAccess,
    user,
    login,
    loginWithGoogle,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
