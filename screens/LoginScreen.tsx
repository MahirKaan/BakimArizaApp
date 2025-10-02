// screens/LoginScreen.tsx - MOCK AUTH ENTEGRELİ TAM HALİ
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

// Types tanımlamaları
interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Hata', 'Lütfen email ve şifre giriniz');
        return;
      }

      await login(email, password);
      
    } catch (error: any) {
      console.log('Login error details:', error);
      Alert.alert('Giriş Başarısız', error?.message || 'Bir hata oluştu');
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    
    // YENİ: Demo hesaplar için otomatik giriş
    try {
      await login(demoEmail, demoPassword);
    } catch (error: any) {
      Alert.alert('Demo Giriş Hatası', error?.message || 'Demo girişinde hata oluştu');
    }
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Logo ve Başlık */}
            <View style={styles.logoContainer}>
              <Ionicons name="construct" size={80} color="#FFF" />
              <Text style={styles.appTitle}>Bakım Arıza Takip</Text>
              <Text style={styles.appSubtitle}>Akıllı Bakım Yönetim Sistemi</Text>
            </View>

            {/* Giriş Formu */}
            <View style={styles.formContainer}>
              <Text style={styles.loginTitle}>Hoş Geldiniz</Text>
              
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#667eea" />
                <TextInput
                  style={styles.input}
                  placeholder="E-posta adresiniz"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#667eea" />
                <TextInput
                  style={styles.input}
                  placeholder="Şifreniz"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#667eea" 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Şifremi Unuttum?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.loginButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>Giriş Yap</Text>
                      <Ionicons name="arrow-forward" size={20} color="#FFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Demo Hesaplar - GÜNCELLENDİ */}
              <View style={styles.demoContainer}>
                <Text style={styles.demoTitle}>Demo Hesaplar (Hızlı Giriş):</Text>
                
                <TouchableOpacity 
                  style={styles.demoButton}
                  onPress={() => handleDemoLogin('technician@bakim.com', '123456')}
                  disabled={loading}
                >
                  <View style={styles.demoButtonContent}>
                    <Ionicons name="person" size={16} color="#667eea" />
                    <Text style={styles.demoButtonText}>Teknisyen</Text>
                  </View>
                  <Text style={styles.demoRoleText}>Ahmet Yılmaz</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.demoButton}
                  onPress={() => handleDemoLogin('manager@bakim.com', '123456')}
                  disabled={loading}
                >
                  <View style={styles.demoButtonContent}>
                    <Ionicons name="people" size={16} color="#667eea" />
                    <Text style={styles.demoButtonText}>Yönetici</Text>
                  </View>
                  <Text style={styles.demoRoleText}>Mehmet Demir</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.demoButton}
                  onPress={() => handleDemoLogin('admin@bakim.com', '123456')}
                  disabled={loading}
                >
                  <View style={styles.demoButtonContent}>
                    <Ionicons name="shield-checkmark" size={16} color="#667eea" />
                    <Text style={styles.demoButtonText}>Sistem Admin</Text>
                  </View>
                  <Text style={styles.demoRoleText}>Admin Panel</Text>
                </TouchableOpacity>
              </View>

              {/* Kayıt Ol Butonu - YENİ EKLENDİ */}
              <TouchableOpacity 
                style={styles.registerButton}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.registerButtonText}>
                  Hesabınız yok mu? <Text style={styles.registerButtonTextBold}>Kayıt Olun</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Bakım Arıza Takip Sistemi v2.0</Text>
              <Text style={styles.footerSubText}>Mock Data • React Native • TypeScript</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'android' ? 30 : 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 16,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8ECFF',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#667eea',
    fontSize: 14,
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  demoContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8ECFF',
    marginBottom: 10,
  },
  demoTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: '#F8F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8ECFF',
    minHeight: 60,
    justifyContent: 'center',
  },
  demoButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  demoButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  demoRoleText: {
    color: '#888',
    fontSize: 12,
    marginLeft: 24,
  },
  registerButton: {
    marginTop: 16,
    padding: 12,
  },
  registerButtonText: {
    color: '#667eea',
    fontSize: 14,
    textAlign: 'center',
  },
  registerButtonTextBold: {
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginBottom: Platform.OS === 'android' ? 20 : 10,
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  footerSubText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
  },
});