// screens/LoginScreen.tsx - GÜNCEL TAM HALİ
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

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
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
              <Text style={styles.appTitle}>Predictive Maintenance</Text>
              <Text style={styles.appSubtitle}>Akıllı Bakım Sistemi</Text>
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

              {/* Demo Hesaplar - DÜZENLENDİ */}
              <View style={styles.demoContainer}>
                <Text style={styles.demoTitle}>Demo Hesaplar:</Text>
                
                <TouchableOpacity 
                  style={styles.demoButton}
                  onPress={() => handleDemoLogin('ahmet@bakim.com', '123456')}
                >
                  <Text style={styles.demoButtonText}>Teknisyen (Ahmet)</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.demoButton}
                  onPress={() => handleDemoLogin('mehmet@bakim.com', '123456')}
                >
                  <Text style={styles.demoButtonText}>Yönetici (Mehmet)</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.demoButton}
                  onPress={() => handleDemoLogin('admin@bakim.com', '123456')}
                >
                  <Text style={styles.demoButtonText}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer - DÜZENLENDİ */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Bakım Arıza Takip Sistemi v1.0</Text>
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
    // Telefon çubuğu için ekstra padding
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
    // Demo butonların tıklanabilir alanını artırmak için
    marginBottom: 10,
  },
  demoTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  demoButton: {
    backgroundColor: '#F8F9FF',
    padding: 14, // Padding artırıldı
    borderRadius: 8,
    marginBottom: 10, // Margin artırıldı
    borderWidth: 1,
    borderColor: '#E8ECFF',
    minHeight: 50, // Minimum yükseklik eklendi
    justifyContent: 'center', // İçeriği dikeyde ortala
  },
  demoButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    // Footer için ekstra margin
    marginBottom: Platform.OS === 'android' ? 20 : 10,
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
});