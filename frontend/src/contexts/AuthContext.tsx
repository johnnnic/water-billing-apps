import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginRequest, AuthContextType } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api'; // Import the real API clientt api 

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for stored auth data on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('water_billing_token');
    const storedUser = localStorage.getItem('water_billing_user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('water_billing_token');
        localStorage.removeItem('water_billing_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      // 1. Call the login endpoint
      const { data } = await api.post('/login', credentials);
      const { access_token } = data;

      // 2. Store the token
      localStorage.setItem('water_billing_token', access_token);
      setToken(access_token);

      // 3. Fetch user data with the new token
      const { data: userData } = await api.get('/user');
      setUser(userData);
      localStorage.setItem('water_billing_user', JSON.stringify(userData));

      toast({
        title: "Login Berhasil",
        description: `Selamat datang, ${userData.name}!`,
      });

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || (error instanceof Error ? error.message : "Terjadi kesalahan");
      toast({
        title: "Login Gagal",
        description: errorMessage,
        variant: "destructive",
      });
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('water_billing_token');
      localStorage.removeItem('water_billing_user');
      toast({
        title: "Logout Berhasil",
        description: "Anda telah berhasil keluar",
      });
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
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