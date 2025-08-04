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
    console.log('🔍 Checking stored auth data...');
    const storedToken = localStorage.getItem('water_billing_token');
    const storedUser = localStorage.getItem('water_billing_user');
    
    console.log('📦 Stored data found:', {
      token: storedToken ? 'exists' : 'missing',
      user: storedUser ? 'exists' : 'missing'
    });
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('👤 Parsed user data:', parsedUser);
        
        // Validate user data structure
        if (parsedUser && parsedUser.id && parsedUser.role && parsedUser.name) {
          setToken(storedToken);
          setUser(parsedUser);
          console.log('✅ Auth data restored successfully');
        } else {
          console.log('❌ Invalid user data structure, clearing storage');
          localStorage.removeItem('water_billing_token');
          localStorage.removeItem('water_billing_user');
        }
      } catch (error) {
        console.error('❌ Error parsing stored user data:', error);
        localStorage.removeItem('water_billing_token');
        localStorage.removeItem('water_billing_user');
      }
    } else {
      console.log('🚫 No complete auth data found');
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      console.log('🔐 Starting login process...');
      
      // 1. Call the login endpoint
      const { data } = await api.post('/login', credentials);
      const { access_token } = data;
      console.log('✅ Login API successful, token received');

      // 2. Store the token
      localStorage.setItem('water_billing_token', access_token);
      setToken(access_token);

      // 3. Fetch user data with the new token
      console.log('👤 Fetching user data...');
      const { data: userData } = await api.get('/user');
      console.log('✅ User data received:', userData);
      
      setUser(userData);
      localStorage.setItem('water_billing_user', JSON.stringify(userData));

      toast({
        title: "Login Berhasil",
        description: `Selamat datang, ${userData.name}! Role: ${userData.role}`,
      });

    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      // Clear any stored data on error
      localStorage.removeItem('water_billing_token');
      localStorage.removeItem('water_billing_user');
      setToken(null);
      setUser(null);
      
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
    console.log('🚪 Starting logout process...');
    try {
      await api.post('/logout');
      console.log('✅ Logout API call successful');
    } catch (error) {
      console.error('❌ Logout API failed:', error);
    } finally {
      // Clear all authentication data
      console.log('🧹 Clearing authentication data...');
      setUser(null);
      setToken(null);
      localStorage.removeItem('water_billing_token');
      localStorage.removeItem('water_billing_user');
      
      // Also clear any other potential cached data
      localStorage.clear();
      
      toast({
        title: "Logout Berhasil",
        description: "Anda telah berhasil keluar",
      });
      
      // Force reload to ensure clean state
      console.log('🔄 Reloading page to ensure clean state...');
      window.location.href = '/login';
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