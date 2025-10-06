// components/CustomErrorFallback.tsx 
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface CustomErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export const CustomErrorFallback: React.FC<CustomErrorFallbackProps> = ({ 
  error, 
  resetError 
}) => (
  <View style={styles.container}>
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.gradient}
    >
      <View style={styles.content}>
        <Ionicons name="bug" size={80} color="#FFF" />
        <Text style={styles.title}>Oops! Bir Sorun Oluştu</Text>
        <Text style={styles.subtitle}>
          Uygulamamız beklenmeyen bir hata ile karşılaştı
        </Text>
        
        <View style={styles.errorDetails}>
          <Text style={styles.errorLabel}>Hata Detayı:</Text>
          <Text style={styles.errorMessage} numberOfLines={3}>
            {error.message}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.retryButton}
          onPress={resetError}
        >
          <LinearGradient
            colors={['#FF6B6B', '#EE5A52']}
            style={styles.retryGradient}
          >
            <Ionicons name="refresh" size={20} color="#FFF" />
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.reportButton}
          onPress={() => {
            // Error reporting logic
            console.log('Error reported:', error);
          }}
        >
          <Text style={styles.reportText}>Hatayı Bildir</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorDetails: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
  },
  errorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'monospace',
  },
  retryButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  retryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  retryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  reportButton: {
    paddingVertical: 12,
  },
  reportText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});