// hooks/useAuth.ts - DEMO KULLANICILAR ENTEGRELİ
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

// DEMO KULLANICILAR - YENİ EKLENDİ
const DEMO_USERS: (User & { password: string })[] = [
  {
    id: '1',
    email: 'technician@bakim.com',
    password: '123456',
    name: 'Ahmet Yılmaz',
    role: 'technician',
    phone: '+905551234567',
    avatar: '👨‍🔧',
    createdAt: new Date().toISOString()
  },
  {
    id: '2', 
    email: 'manager@bakim.com',
    password: '123456',
    name: 'Mehmet Demir',
    role: 'manager',
    phone: '+905553456789',
    avatar: '👨‍💼',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    email: 'admin@bakim.com', 
    password: '123456',
    name: 'Sistem Admin',
    role: 'admin',
    phone: '+905554567890',
    avatar: '👨‍💻',
    createdAt: new Date().toISOString()
  },
  // ESKİ KULLANICILAR DA KALSIN
  {
    id: '4',
    email: 'ahmet@bakim.com',
    password: '123456',
    name: 'Ahmet Yılmaz',
    role: 'technician',
    phone: '+905551234567',
    avatar: '👨‍🔧'
  },
  {
    id: '5', 
    email: 'mehmet@bakim.com',
    password: '123456',
    name: 'Mehmet Demir',
    role: 'manager',
    phone: '+905553456789',
    avatar: '👨‍💼'
  },
  {
    id: '6',
    email: 'admin@bakim.com', 
    password: '123456',
    name: 'Admin User',
    role: 'admin',
    phone: '+905554567890',
    avatar: '👨‍💻'
  }
];

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
      console.log('🔍 Stored user data:', userData);
      
      // OTOMATİK LOGIN KAPATILDI - SADECE DEBUG İÇİN AÇ
      // if (userData) {
      //   setUser(userData);
      // }
      
      // TEST MOD: Hiçbir kullanıcıyı otomatik login yapma
      setUser(null);
      
    } catch (error) {
      console.log('Check user error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // TÜM KULLANICILARI BİRLEŞTİR
      const allUsers = [...DEMO_USERS];
      
      const foundUser = allUsers.find(u => u.email === email && u.password === password);
      
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

      // Email zaten var mı kontrol et
      const allUsers = [...DEMO_USERS];
      const existingUser = allUsers.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('Bu email adresi zaten kullanılıyor');
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