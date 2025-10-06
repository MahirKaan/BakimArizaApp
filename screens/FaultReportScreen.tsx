// screens/FaultReportScreen.tsx - FOTOĞRAF FIXLENMİŞ TAM HAL
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
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import useFaultReports, { FaultReport } from '../hooks/useFaultReports';

const { width } = Dimensions.get('window');

// Types tanımlamaları - FOTOĞRAF ALANI EKLENDİ
interface FaultReportScreenProps {
  navigation: any;
}

interface FaultType {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: readonly [string, string];
}

interface PriorityType {
  id: string;
  name: string;
  color: string;
  gradient: readonly [string, string];
  icon: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  faultType?: string;
  priority?: string;
  location?: string;
}

// YENİ: FaultReport interface'ine photos alanı ekle
interface ExtendedFaultReport extends Omit<FaultReport, 'id' | 'createdAt' | 'updatedAt'> {
  photos?: string[]; // Fotoğraflar için opsiyonel alan
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
    id: 'low', 
    name: 'Düşük', 
    color: '#27AE60', 
    gradient: ['#27AE60', '#2ECC71'] as const,
    icon: 'trending-down'
  },
  { 
    id: 'medium', 
    name: 'Orta', 
    color: '#F39C12', 
    gradient: ['#F39C12', '#F1C40F'] as const,
    icon: 'remove'
  },
  { 
    id: 'high', 
    name: 'Yüksek', 
    color: '#E74C3C', 
    gradient: ['#E74C3C', '#C0392B'] as const,
    icon: 'trending-up'
  },
  { 
    id: 'critical', 
    name: 'Kritik', 
    color: '#8B0000', 
    gradient: ['#8B0000', '#B22222'] as const,
    icon: 'warning'
  }
];

export default function FaultReportScreen({ navigation }: FaultReportScreenProps) {
  const { user } = useAuth();
  const { addFaultReport, loading: hookLoading } = useFaultReports();
  
  const [darkMode, setDarkMode] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [faultType, setFaultType] = useState('Mekanik');
  const [locationText, setLocationText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // FORM VALIDATION STATE
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({
    title: false,
    description: false,
    faultType: false,
    priority: false,
    location: false,
  });

  // Animations
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ADIM TAKİBİ - Form dolduruldukça adımı güncelle
  useEffect(() => {
    let step = 1;
    
    if (title.trim().length >= 3) {
      step = 2;
    }
    
    if (title.trim().length >= 3 && faultType && priority) {
      step = 3;
    }
    
    if (title.trim().length >= 3 && faultType && priority && description.trim().length >= 10) {
      step = 4;
    }
    
    setCurrentStep(step);
    
    Animated.timing(progressAnim, {
      toValue: step / 4,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [title, faultType, priority, description]);

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1:
        return 'Arıza başlığını gir';
      case 2:
        return 'Arıza tipi ve öncelik seç';
      case 3:
        return 'Açıklama yaz';
      case 4:
        return 'Kaydı tamamla';
      default:
        return 'Başlayın';
    }
  };

  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'title':
        if (!value.trim()) return 'Arıza başlığı gereklidir';
        if (value.trim().length < 3) return 'Başlık en az 3 karakter olmalıdır';
        if (value.trim().length > 100) return 'Başlık en fazla 100 karakter olmalıdır';
        return undefined;
      
      case 'description':
        if (!value.trim()) return 'Arıza açıklaması gereklidir';
        if (value.trim().length < 10) return 'Açıklama en az 10 karakter olmalıdır';
        if (value.trim().length > 1000) return 'Açıklama en fazla 1000 karakter olmalıdır';
        return undefined;
      
      case 'faultType':
        if (!value) return 'Arıza tipi seçilmelidir';
        return undefined;
      
      case 'priority':
        if (!value) return 'Öncelik seviyesi seçilmelidir';
        return undefined;
      
      case 'location':
        if (!value.trim()) return 'Lokasyon bilgisi gereklidir';
        return undefined;
      
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      title: validateField('title', title),
      description: validateField('description', description),
      faultType: validateField('faultType', faultType),
      priority: validateField('priority', priority),
      location: validateField('location', locationText),
    };

    setErrors(newErrors);
    
    setTouched({
      title: true,
      description: true,
      faultType: true,
      priority: true,
      location: true,
    });

    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const handleFieldChange = (field: string, value: string) => {
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    switch (field) {
      case 'title':
        setTitle(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'location':
        setLocationText(value);
        break;
    }
  };

  const handleFieldBlur = (field: string, value: string) => {
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Konum İzni', 'Konum erişimi için izin gereklidir.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocationText('Otomatik Konum');
    })();

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
  }, []);

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
        setPhotos(prev => [...prev, ...newPhotos]);
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
        setPhotos(prev => [...prev, uri]);
      }
    } catch (err) {
      Alert.alert('Hata', 'Kamera açılırken bir sorun oluştu.');
    }
  };

  const removePhoto = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
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

  // YENİ: FOTOĞRAF KAYDETME SORUNU ÇÖZÜLDÜ!
  const handleSubmit = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerShake();
      Alert.alert('Eksik Bilgi', 'Lütfen formdaki hataları düzeltin.');
      return;
    }

    setLoading(true);

    try {
      // YENİ: ExtendedFaultReport kullan ve photos'u ekle
      const newFault: ExtendedFaultReport = {
        title: title,
        description: description,
        priority: priority,
        status: 'pending',
        location: locationText,
        reportedBy: user?.name || 'Bilinmeyen Kullanıcı',
        // KRİTİK FIX: Fotoğrafları kaydet
        photos: photos.length > 0 ? photos : undefined,
      };

      console.log('Yeni Arıza Verisi:', newFault);
      console.log('Kaydedilen Fotoğraflar:', photos);

      // YENİ: Type assertion ile photos'u gönder
      await addFaultReport(newFault as Omit<FaultReport, 'id' | 'createdAt' | 'updatedAt'>);

      setShowSuccess(true);
      animateSuccess();
      
      setTimeout(() => {
        // Formu temizle
        setTitle('');
        setDescription('');
        setLocationText('');
        setPhotos([]);
        setPriority('medium');
        setFaultType('Mekanik');
        setCurrentStep(1);
        setErrors({});
        setTouched({
          title: false,
          description: false,
          faultType: false,
          priority: false,
          location: false,
        });
        navigation.navigate('FaultList');
      }, 2000);

    } catch (err) {
      console.error('Arıza ekleme hatası:', err);
      Alert.alert('Hata', 'Arıza eklenirken bir sorun oluştu.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityConfig = (pri: string) => {
    return ONCELIKLER.find(p => p.id === pri) || ONCELIKLER[1];
  };

  const getFaultTypeConfig = (type: string) => {
    return ARIZA_TIPLERI.find(f => f.name === type) || ARIZA_TIPLERI[0];
  };

  const ProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressBackground, { 
        backgroundColor: darkMode ? '#334' : '#E8ECFF' 
      }]}>
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
      <View style={styles.stepInfo}>
        <Text style={[styles.progressText, { 
          color: darkMode ? '#889' : '#667' 
        }]}>
          Adım {currentStep}/4
        </Text>
        <Text style={[styles.stepDescription, { 
          color: darkMode ? '#667' : '#889' 
        }]}>
          {getStepDescription(currentStep)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar 
        backgroundColor={darkMode ? '#1A1A2E' : '#F8F9FF'} 
        barStyle={darkMode ? 'light-content' : 'dark-content'} 
        translucent={false}
      />
      
      <View style={[styles.customHeader, { 
        backgroundColor: darkMode ? '#1A1A2E' : '#F8F9FF',
        borderBottomColor: darkMode ? '#334' : '#E8E8E8'
      }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={darkMode ? '#FFF' : '#1A1A2E'} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.greeting, { color: darkMode ? '#FFF' : '#1A1A2E' }]}>
              Arıza Kaydı
            </Text>
            <Text style={[styles.date, { color: darkMode ? '#889' : '#666' }]}>
              Profesyonel arıza takip sistemi
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.themeToggle, { 
            backgroundColor: darkMode ? '#334' : '#E8ECFF' 
          }]}
          onPress={() => setDarkMode(!darkMode)}
        >
          <Ionicons 
            name={darkMode ? 'moon' : 'sunny'} 
            size={20} 
            color={darkMode ? '#FFD700' : '#FFA500'} 
          />
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={darkMode ? ['#0A0A0A', '#1A1A2E'] as const : ['#FFFFFF', '#F8FAFF'] as const}
        style={styles.container}
      >
        <ProgressBar />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.formContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            <Animated.View 
              style={[
                styles.formCard, 
                { 
                  backgroundColor: darkMode ? '#1E1E2E' : '#FFF',
                  transform: [{ translateX: errors.title ? shakeAnim : 0 }]
                }
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#667EEA' }]}>
                  <Ionicons name="document-text" size={24} color="#FFF" />
                </View>
                <Text style={[styles.cardTitle, { color: darkMode ? '#FFF' : '#1A1A2E' }]}>
                  Arıza Başlığı *
                </Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: darkMode ? '#CCD' : '#445' }]}>
                  Arıza Başlığı *
                </Text>
                <TextInput
                  style={[
                    styles.textInput, 
                    { 
                      backgroundColor: darkMode ? '#2A2A3E' : '#F8FAFF',
                      color: darkMode ? '#FFF' : '#1A1A2E',
                      borderColor: errors.title ? '#E74C3C' : (darkMode ? '#334' : '#E2E8F0')
                    }
                  ]}
                  value={title}
                  onChangeText={(value) => handleFieldChange('title', value)}
                  onBlur={() => handleFieldBlur('title', title)}
                  placeholder="Arıza başlığını giriniz..."
                  placeholderTextColor={darkMode ? '#667' : '#AAB'}
                />
                {errors.title && touched.title && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="warning" size={16} color="#E74C3C" />
                    <Text style={styles.errorText}>{errors.title}</Text>
                  </View>
                )}
              </View>
            </Animated.View>

            <Animated.View 
              style={[
                styles.formCard, 
                { 
                  backgroundColor: darkMode ? '#1E1E2E' : '#FFF',
                  transform: [{ translateX: errors.location ? shakeAnim : 0 }]
                }
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#4ECDC4' }]}>
                  <Ionicons name="location" size={24} color="#FFF" />
                </View>
                <Text style={[styles.cardTitle, { color: darkMode ? '#FFF' : '#1A1A2E' }]}>
                  Lokasyon *
                </Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: darkMode ? '#CCD' : '#445' }]}>
                  Arıza Lokasyonu *
                </Text>
                <TextInput
                  style={[
                    styles.textInput, 
                    { 
                      backgroundColor: darkMode ? '#2A2A3E' : '#F8FAFF',
                      color: darkMode ? '#FFF' : '#1A1A2E',
                      borderColor: errors.location ? '#E74C3C' : (darkMode ? '#334' : '#E2E8F0')
                    }
                  ]}
                  value={locationText}
                  onChangeText={(value) => handleFieldChange('location', value)}
                  onBlur={() => handleFieldBlur('location', locationText)}
                  placeholder="Arızanın olduğu lokasyonu giriniz..."
                  placeholderTextColor={darkMode ? '#667' : '#AAB'}
                />
                {errors.location && touched.location && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="warning" size={16} color="#E74C3C" />
                    <Text style={styles.errorText}>{errors.location}</Text>
                  </View>
                )}
              </View>
            </Animated.View>

            <Animated.View 
              style={[
                styles.formCard, 
                { 
                  backgroundColor: darkMode ? '#1E1E2E' : '#FFF',
                  transform: [{ translateX: errors.faultType ? shakeAnim : 0 }]
                }
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#FF6B6B' }]}>
                  <MaterialIcons name="handyman" size={24} color="#FFF" />
                </View>
                <Text style={[styles.cardTitle, { color: darkMode ? '#FFF' : '#1A1A2E' }]}>
                  Arıza Tipi *
                </Text>
              </View>

              {errors.faultType && touched.faultType && (
                <View style={styles.errorContainer}>
                  <Ionicons name="warning" size={16} color="#E74C3C" />
                  <Text style={styles.errorText}>{errors.faultType}</Text>
                </View>
              )}

              <View style={styles.gridContainer}>
                {ARIZA_TIPLERI.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => {
                      setFaultType(type.name);
                      handleFieldChange('faultType', type.name);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={styles.gridItem}
                  >
                    <LinearGradient
                      colors={faultType === type.name ? type.gradient : [darkMode ? '#2A2A3E' : '#F8FAFF', darkMode ? '#2A2A3E' : '#F8FAFF'] as const}
                      style={[
                        styles.typeButton,
                        { 
                          borderColor: faultType === type.name ? type.color : 
                                    (errors.faultType && touched.faultType ? '#E74C3C' : 'transparent')
                        }
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
            </Animated.View>

            <Animated.View 
              style={[
                styles.formCard, 
                { 
                  backgroundColor: darkMode ? '#1E1E2E' : '#FFF',
                  transform: [{ translateX: errors.priority ? shakeAnim : 0 }]
                }
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#FD746C' }]}>
                  <Ionicons name="warning" size={24} color="#FFF" />
                </View>
                <Text style={[styles.cardTitle, { color: darkMode ? '#FFF' : '#1A1A2E' }]}>
                  Öncelik Seviyesi *
                </Text>
              </View>

              {errors.priority && touched.priority && (
                <View style={styles.errorContainer}>
                  <Ionicons name="warning" size={16} color="#E74C3C" />
                  <Text style={styles.errorText}>{errors.priority}</Text>
                </View>
              )}

              <View style={styles.priorityGrid}>
                {ONCELIKLER.map((pri) => (
                  <TouchableOpacity
                    key={pri.id}
                    onPress={() => {
                      setPriority(pri.id as 'low' | 'medium' | 'high' | 'critical');
                      handleFieldChange('priority', pri.id);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                    style={styles.priorityItem}
                  >
                    <LinearGradient
                      colors={priority === pri.id ? pri.gradient : [darkMode ? '#2A2A3E' : '#F8FAFF', darkMode ? '#2A2A3E' : '#F8FAFF'] as const}
                      style={[
                        styles.priorityButton,
                        { 
                          borderColor: priority === pri.id ? pri.color : 
                                    (errors.priority && touched.priority ? '#E74C3C' : 'transparent')
                        }
                      ]}
                    >
                      <Ionicons 
                        name={pri.icon as any} 
                        size={24} 
                        color={priority === pri.id ? '#FFF' : pri.color} 
                      />
                      <Text style={[
                        styles.priorityText,
                        { color: priority === pri.id ? '#FFF' : (darkMode ? '#CCD' : '#445') }
                      ]}>
                        {pri.name}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            <Animated.View 
              style={[
                styles.formCard, 
                { 
                  backgroundColor: darkMode ? '#1E1E2E' : '#FFF',
                  transform: [{ translateX: errors.description ? shakeAnim : 0 }]
                }
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#A78BFA' }]}>
                  <Ionicons name="document-text" size={24} color="#FFF" />
                </View>
                <Text style={[styles.cardTitle, { color: darkMode ? '#FFF' : '#1A1A2E' }]}>
                  Arıza Açıklaması *
                </Text>
              </View>

              <TextInput
                style={[
                  styles.textArea, 
                  { 
                    backgroundColor: darkMode ? '#2A2A3E' : '#F8FAFF',
                    color: darkMode ? '#FFF' : '#1A1A2E',
                    borderColor: errors.description ? '#E74C3C' : (darkMode ? '#334' : '#E2E8F0')
                  }
                ]}
                value={description}
                onChangeText={(value) => handleFieldChange('description', value)}
                onBlur={() => handleFieldBlur('description', description)}
                multiline
                numberOfLines={6}
                placeholder="Arızayı detaylı bir şekilde açıklayın..."
                placeholderTextColor={darkMode ? '#667' : '#AAB'}
                textAlignVertical="top"
              />
              {errors.description && touched.description && (
                <View style={styles.errorContainer}>
                  <Ionicons name="warning" size={16} color="#E74C3C" />
                  <Text style={styles.errorText}>{errors.description}</Text>
                </View>
              )}
              <Text style={[styles.charCount, { color: darkMode ? '#889' : '#667' }]}>
                {description.length}/1000 karakter
              </Text>
            </Animated.View>

            <View style={[styles.formCard, { backgroundColor: darkMode ? '#1E1E2E' : '#FFF' }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#96CEB4' }]}>
                  <Ionicons name="camera" size={24} color="#FFF" />
                </View>
                <Text style={[styles.cardTitle, { color: darkMode ? '#FFF' : '#1A1A2E' }]}>
                  Görsel Ekleri (Opsiyonel)
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

            <TouchableOpacity 
              style={[styles.submitButton, { 
                opacity: (loading || hookLoading) ? 0.7 : 1,
              }]}
              onPress={handleSubmit}
              disabled={loading || hookLoading}
            >
              <LinearGradient
                colors={getPriorityConfig(priority).gradient}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {(loading || hookLoading) ? (
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
              colors={['#4ECDC4', '#44A08D'] as const}
              style={styles.successCard}
            >
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-done" size={60} color="#FFF" />
              </View>
              <Text style={styles.successTitle}>Kayıt Tamamlandı!</Text>
              <Text style={styles.successMessage}>
                Arıza kaydınız başarıyla oluşturuldu.
              </Text>
            </LinearGradient>
          </Animated.View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    marginTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    padding: 4,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
  },
  date: {
    fontSize: 14,
    marginTop: 2,
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
    marginTop: 10,
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
  },
  stepInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  stepDescription: {
    fontSize: 12,
    fontWeight: '500',
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
  textArea: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
    minHeight: 140,
    textAlignVertical: 'top',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
    marginTop: 4,
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
    position: 'relative',
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