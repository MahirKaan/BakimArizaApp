// screens/FaultReportScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Animated,
  Easing,
  Switch,
  Dimensions,
  StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Types tanımlamaları
interface FaultReportScreenProps {
  navigation: any;
}

interface FaultType {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: readonly [string, string]; // Düzeltme: readonly tuple
}

interface PriorityType {
  id: string;
  name: string;
  color: string;
  gradient: readonly [string, string]; // Düzeltme: readonly tuple
  icon: string;
}

const ARIZA_TIPLERI: FaultType[] = [
  { 
    id: '1', 
    name: 'Mekanik', 
    icon: 'settings', 
    color: '#FF6B35', 
    gradient: ['#FF6B35', '#FF8E35'] as const 
  },
  { 
    id: '2', 
    name: 'Elektrik', 
    icon: 'flash', 
    color: '#4ECDC4', 
    gradient: ['#4ECDC4', '#44A08D'] as const 
  },
  { 
    id: '3', 
    name: 'Yazılım', 
    icon: 'code', 
    color: '#45B7D1', 
    gradient: ['#45B7D1', '#3498DB'] as const 
  },
  { 
    id: '4', 
    name: 'Diğer', 
    icon: 'more-horiz', 
    color: '#96CEB4', 
    gradient: ['#96CEB4', '#7BC6A8'] as const 
  }
];

const ONCELIKLER: PriorityType[] = [
  { 
    id: '1', 
    name: 'Düşük', 
    color: '#27AE60', 
    gradient: ['#27AE60', '#2ECC71'] as const,
    icon: 'trending-down'
  },
  { 
    id: '2', 
    name: 'Orta', 
    color: '#F39C12', 
    gradient: ['#F39C12', '#F1C40F'] as const,
    icon: 'remove'
  },
  { 
    id: '3', 
    name: 'Yüksek', 
    color: '#E74C3C', 
    gradient: ['#E74C3C', '#C0392B'] as const,
    icon: 'trending-up'
  }
];

export default function FaultReportScreen({ navigation }: FaultReportScreenProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [equipmentId, setEquipmentId] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Orta');
  const [faultType, setFaultType] = useState('Mekanik');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoBlobs, setPhotoBlobs] = useState<Blob[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Animations
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Konum İzni', 'Konum erişimi için izin gereklidir.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    })();

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: currentStep / 4,
        duration: 600,
        useNativeDriver: false,
      }),
    ]).start();
  }, [currentStep]);

  const pickImage = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsMultipleSelection: true,
        selectionLimit: 8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newPhotos = result.assets.map(asset => asset.uri);
        setPhotos([...photos, ...newPhotos]);

        const newBlobs = await Promise.all(
          result.assets.map(async (asset) => {
            const response = await fetch(asset.uri);
            return await response.blob();
          })
        );
        setPhotoBlobs([...photoBlobs, ...newBlobs]);
      }
    } catch (err) {
      Alert.alert('Hata', 'Fotoğraf seçilirken bir sorun oluştu.');
    }
  };

  const takePhoto = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setPhotos([...photos, uri]);

        const response = await fetch(uri);
        const blob = await response.blob();
        setPhotoBlobs([...photoBlobs, blob]);
      }
    } catch (err) {
      Alert.alert('Hata', 'Kamera açılırken bir sorun oluştu.');
    }
  };

  const removePhoto = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPhotos = photos.filter((_, i) => i !== index);
    const newBlobs = photoBlobs.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoBlobs(newBlobs);
  };

  const animateSuccess = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Animated.sequence([
      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          tension: 150,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1500),
      Animated.timing(successOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccess(false);
      successScale.setValue(0);
    });
  };

  const handleSubmit = async () => {
    if (!equipmentId.trim() || !description.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen gerekli alanları doldurun.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < photoBlobs.length; i++) {
        const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
        // Supabase upload işlemi burada olacak
        setUploadProgress((i + 1) / photoBlobs.length);
      }

      // Supabase insert işlemi burada olacak

      setShowSuccess(true);
      animateSuccess();
      
      // Reset form
      setTimeout(() => {
        setEquipmentId('');
        setDescription('');
        setPhotos([]);
        setPhotoBlobs([]);
        setPriority('Orta');
        setFaultType('Mekanik');
        setCurrentStep(1);
      }, 2000);

    } catch (err) {
      Alert.alert('Hata', 'İşlem sırasında bir sorun oluştu.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const getPriorityConfig = (pri: string) => {
    return ONCELIKLER.find(p => p.name === pri) || ONCELIKLER[1];
  };

  const getFaultTypeConfig = (type: string) => {
    return ARIZA_TIPLERI.find(f => f.name === type) || ARIZA_TIPLERI[0];
  };

  const ProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressBackground, { backgroundColor: darkMode ? '#334' : '#E8ECFF' }]}>
        <Animated.View 
          style={[
            styles.progressFill,
            { 
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: getPriorityConfig(priority).color,
            }
          ]} 
        />
      </View>
      <Text style={[styles.progressText, { color: darkMode ? '#889' : '#667' }]}>
        Adım {currentStep}/4
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={darkMode ? ['#0A0A0A', '#1A1A2E'] as const : ['#FFFFFF', '#F8FAFF'] as const} // Düzeltme: as const
        style={styles.container}
      >
        <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} translucent />
        
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          <View>
            <Text style={[styles.title, { color: darkMode ? '#FFF' : '#1A1A2E' }]}>
              Arıza Kaydı
            </Text>
            <Text style={[styles.subtitle, { color: darkMode ? '#889' : '#667' }]}>
              Profesyonel arıza takip sistemi
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.themeToggle, { backgroundColor: darkMode ? '#334' : '#E8ECFF' }]}
            onPress={() => setDarkMode(!darkMode)}
          >
            <Ionicons 
              name={darkMode ? 'moon' : 'sunny'} 
              size={20} 
              color={darkMode ? '#FFD700' : '#FFA500'} 
            />
          </TouchableOpacity>
        </Animated.View>

        <ProgressBar />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Form */}
          <Animated.View 
            style={[
              styles.formContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            {/* Equipment ID Card */}
            <View style={[styles.formCard, { backgroundColor: darkMode ? '#1E1E2E' : '#FFF' }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#667EEA' }]}>
                  <Ionicons name="hardware-chip" size={24} color="#FFF" />
                </View>
                <Text style={[styles.cardTitle, { color: darkMode ? '#FFF' : '#1A1A2E' }]}>
                  Cihaz Bilgileri
                </Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: darkMode ? '#CCD' : '#445' }]}>
                  Cihaz Numarası
                </Text>
                <TextInput
                  style={[styles.textInput, { 
                    backgroundColor: darkMode ? '#2A2A3E' : '#F8FAFF',
                    color: darkMode ? '#FFF' : '#1A1A2E',
                    borderColor: darkMode ? '#334' : '#E2E8F0'
                  }]}
                  value={equipmentId}
                  onChangeText={setEquipmentId}
                  placeholder="Cihaz ID giriniz..."
                  placeholderTextColor={darkMode ? '#667' : '#AAB'}
                />
              </View>
            </View>

            {/* Fault Type Selection */}
            <View style={[styles.formCard, { backgroundColor: darkMode ? '#1E1E2E' : '#FFF' }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#4ECDC4' }]}>
                  <MaterialIcons name="handyman" size={24} color="#FFF" />
                </View>
                <Text style={[styles.cardTitle, { color: darkMode ? '#FFF' : '#1A1A2E' }]}>
                  Arıza Tipi
                </Text>
              </View>

              <View style={styles.gridContainer}>
                {ARIZA_TIPLERI.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => {
                      setFaultType(type.name);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={styles.gridItem}
                  >
                    <LinearGradient
                      colors={faultType === type.name ? type.gradient : [darkMode ? '#2A2A3E' : '#F8FAFF', darkMode ? '#2A2A3E' : '#F8FAFF'] as const} // Düzeltme: as const
                      style={[
                        styles.typeButton,
                        { borderColor: faultType === type.name ? type.color : 'transparent' }
                      ]}
                    >
                      <MaterialIcons 
                        name={type.icon as any} 
                        size={28} 
                        color={faultType === type.name ? '#FFF' : type.color} 
                      />
                      <Text style={[
                        styles.typeText,
                        { color: faultType === type.name ? '#FFF' : (darkMode ? '#CCD' : '#445') }
                      ]}>
                        {type.name}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Priority Selection */}
            <View style={[styles.formCard, { backgroundColor: darkMode ? '#1E1E2E' : '#FFF' }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#FF6B6B' }]}>
                  <Ionicons name="warning" size={24} color="#FFF" />
                </View>
                <Text style={[styles.cardTitle, { color: darkMode ? '#FFF' : '#1A1A2E' }]}>
                  Öncelik Seviyesi
                </Text>
              </View>

              <View style={styles.priorityGrid}>
                {ONCELIKLER.map((pri) => (
                  <TouchableOpacity
                    key={pri.id}
                    onPress={() => {
                      setPriority(pri.name);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                    style={styles.priorityItem}
                  >
                    <LinearGradient
                      colors={priority === pri.name ? pri.gradient : [darkMode ? '#2A2A3E' : '#F8FAFF', darkMode ? '#2A2A3E' : '#F8FAFF'] as const} // Düzeltme: as const
                      style={[
                        styles.priorityButton,
                        { borderColor: priority === pri.name ? pri.color : 'transparent' }
                      ]}
                    >
                      <Ionicons 
                        name={pri.icon as any} 
                        size={24} 
                        color={priority === pri.name ? '#FFF' : pri.color} 
                      />
                      <Text style={[
                        styles.priorityText,
                        { color: priority === pri.name ? '#FFF' : (darkMode ? '#CCD' : '#445') }
                      ]}>
                        {pri.name}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description */}
            <View style={[styles.formCard, { backgroundColor: darkMode ? '#1E1E2E' : '#FFF' }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#FD746C' }]}>
                  <Ionicons name="document-text" size={24} color="#FFF" />
                </View>
                <Text style={[styles.cardTitle, { color: darkMode ? '#FFF' : '#1A1A2E' }]}>
                  Arıza Açıklaması
                </Text>
              </View>

              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: darkMode ? '#2A2A3E' : '#F8FAFF',
                  color: darkMode ? '#FFF' : '#1A1A2E',
                  borderColor: darkMode ? '#334' : '#E2E8F0'
                }]}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                placeholder="Arızayı detaylı bir şekilde açıklayın..."
                placeholderTextColor={darkMode ? '#667' : '#AAB'}
                textAlignVertical="top"
              />
            </View>

            {/* Photo Section */}
            <View style={[styles.formCard, { backgroundColor: darkMode ? '#1E1E2E' : '#FFF' }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#A78BFA' }]}>
                  <Ionicons name="camera" size={24} color="#FFF" />
                </View>
                <Text style={[styles.cardTitle, { color: darkMode ? '#FFF' : '#1A1A2E' }]}>
                  Görsel Ekleri
                </Text>
              </View>

              <View style={styles.photoActions}>
                <TouchableOpacity 
                  style={[styles.photoActionBtn, { backgroundColor: darkMode ? '#2A2A3E' : '#F8FAFF' }]}
                  onPress={takePhoto}
                >
                  <Ionicons name="camera-outline" size={24} color="#667EEA" />
                  <Text style={[styles.photoActionText, { color: darkMode ? '#CCD' : '#445' }]}>
                    Fotoğraf Çek
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.photoActionBtn, { backgroundColor: darkMode ? '#2A2A3E' : '#F8FAFF' }]}
                  onPress={pickImage}
                >
                  <Ionicons name="image-outline" size={24} color="#667EEA" />
                  <Text style={[styles.photoActionText, { color: darkMode ? '#CCD' : '#445' }]}>
                    Galeriden Seç
                  </Text>
                </TouchableOpacity>
              </View>

              {photos.length > 0 && (
                <View style={styles.photosGrid}>
                  {photos.map((uri, index) => (
                    <View key={index} style={styles.photoItem}>
                      <Image source={{ uri }} style={styles.photo} />
                      <TouchableOpacity 
                        style={styles.removePhoto}
                        onPress={() => removePhoto(index)}
                      >
                        <Ionicons name="close-circle" size={28} color="#FF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, { 
                opacity: loading ? 0.7 : 1,
              }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={getPriorityConfig(priority).gradient}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="#FFF" />
                    <Text style={styles.submitText}>Arıza Kaydını Oluştur</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        {/* Success Overlay */}
        {showSuccess && (
          <Animated.View 
            style={[
              styles.successOverlay,
              { 
                opacity: successOpacity,
                transform: [{ scale: successScale }] 
              }
            ]}
          >
            <LinearGradient
              colors={['#4ECDC4', '#44A08D'] as const} // Düzeltme: as const
              style={styles.successCard}
            >
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-done" size={60} color="#FFF" />
              </View>
              <Text style={styles.successTitle}>Kayıt Tamamlandı!</Text>
              <Text style={styles.successMessage}>
                Arıza kaydınız başarıyla oluşturuldu. Takip numaranız: #{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </Text>
            </LinearGradient>
          </Animated.View>
        )}
      </LinearGradient>
    </View>
  );
}

// Styles kısmı aynı kalacak, sadece TypeScript hataları çözüldü
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  themeToggle: {
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  progressBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formContainer: {
    padding: 16,
  },
  formCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridItem: {
    width: '50%',
    padding: 6,
  },
  typeButton: {
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  typeText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  priorityGrid: {
    flexDirection: 'row',
    marginHorizontal: -6,
  },
  priorityItem: {
    flex: 1,
    padding: 6,
  },
  priorityButton: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  priorityText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textArea: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
    minHeight: 140,
    textAlignVertical: 'top',
  },
  photoActions: {
    flexDirection: 'row',
    marginHorizontal: -8,
    marginBottom: 16,
  },
  photoActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  photoActionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  photoItem: {
    width: '33.33%',
    padding: 6,
  },
  photo: {
    width: '100%',
    height: 100,
    borderRadius: 12,
  },
  removePhoto: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  submitText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successCard: {
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
});