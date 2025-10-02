// hooks/useAuth.ts - OTOMATİK LOGIN KAPATILDI
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import useLocalStorage from './useLocalStorage';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: 'technician' | 'manager' | 'admin';
  phone?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => Promise<boolean>;
  updateProfile: (updates: any) => Promise<any>;
  isAuthenticated: boolean;
  isTechnician: boolean;
  isManager: boolean;
  isAdmin: boolean;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { storeData, getData, removeData } = useLocalStorage();

  // Uygulama açıldığında kullanıcıyı kontrol et
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userData = await getData('user');
      console.log('🔍 Stored user data:', userData); // Debug için
      
      // OTOMATİK LOGIN KAPATILDI - SADECE DEBUG İÇİN AÇ
      // if (userData) {
      //   setUser(userData);
      // }
      
      // TEST MOD: Hiçbir kullanıcıyı otomatik login yapma
      // Sadece manuel login ile giriş yapılabilir
      setUser(null);
      
    } catch (error) {
      console.log('Check user error:', error);
      setUser(null); // Hata durumunda da null yap
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Mock users - sonra database'e geçeceğiz
      const mockUsers: (User & { password: string })[] = [
        {
          id: '1',
          email: 'ahmet@bakim.com',
          password: '123456',
          name: 'Ahmet Yılmaz',
          role: 'technician',
          phone: '+905551234567',
          avatar: '👨‍🔧'
        },
        {
          id: '2', 
          email: 'mehmet@bakim.com',
          password: '123456',
          name: 'Mehmet Demir',
          role: 'manager',
          phone: '+905553456789',
          avatar: '👨‍💼'
        },
        {
          id: '3',
          email: 'admin@bakim.com', 
          password: '123456',
          name: 'Admin User',
          role: 'admin',
          phone: '+905554567890',
          avatar: '👨‍💻'
        }
      ];

      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        await storeData('user', userWithoutPassword);
        setUser(userWithoutPassword);
        console.log('✅ Login successful:', userWithoutPassword);
        return userWithoutPassword;
      } else {
        throw new Error('Geçersiz email veya şifre');
      }
    } catch (error) {
      console.log('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      
      // Basit validation
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error('Lütfen tüm alanları doldurun');
      }

      // Email format kontrolü
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Geçerli bir email adresi girin');
      }

      const newUser: User = {
        id: Date.now().toString(),
        ...userData,
        role: 'technician', // Default role
        avatar: '👤',
        createdAt: new Date().toISOString()
      };

      // Kullanıcıyı kaydet
      await storeData('user', newUser);
      setUser(newUser);
      
      return newUser;
    } catch (error) {
      console.log('Register error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await removeData('user');
      setUser(null);
      console.log('✅ Logout successful');
      return true;
    } catch (error) {
      console.log('Logout error:', error);
      return false;
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      if (!user) throw new Error('Kullanıcı bulunamadı');

      const updatedUser: User = { 
        ...user, 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      await storeData('user', updatedUser);
      setUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.log('Update profile error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isTechnician: user?.role === 'technician',
    isManager: user?.role === 'manager',
    isAdmin: user?.role === 'admin'
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

// Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;