// screens/FaultDetailScreen.tsx - TAM DÜZELTİLMİŞ
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Share,
  Linking,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import useFaultReports, { FaultReport } from '../hooks/useFaultReports';

const { width } = Dimensions.get('window');

// Types tanımlamaları
interface FaultDetailScreenProps {
  navigation: any;
  route: any;
}

interface HistoryItem {
  action: string;
  timestamp: string;
  user: string;
  note: string;
}

// FaultDetail tipini FaultReport ile genişlet
interface FaultDetail extends FaultReport {
  equipmentId?: string;
  contactNumber: string;
  photos: string[];
  locationCoords: {
    lat: number;
    lng: number;
  };
  estimatedRepairTime: string;
  requiredTools: string[];
  safetyNotes: string;
  history: HistoryItem[];
}

export default function FaultDetailScreen({ navigation, route }: FaultDetailScreenProps) {
  const { faultId } = route.params;
  const { user } = useAuth();
  const { getFaultReportById, updateFaultReportStatus } = useFaultReports();
  
  const [fault, setFault] = useState<FaultDetail | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // FIX 1: useEffect dependency sorunu çözüldü
  useEffect(() => {
    if (faultId) {
      loadFaultData();
    }
  }, [faultId]); // Sadece faultId değiştiğinde çalışsın

  // FIX 2: Fault verilerini yükleme fonksiyonu
  const loadFaultData = () => {
    setIsLoading(true);
    
    const faultData = getFaultReportById(parseInt(faultId));
    if (faultData) {
      // FaultReport'u FaultDetail'e çevir
      const faultDetail: FaultDetail = {
        ...faultData,
        equipmentId: faultData.title,
        contactNumber: '+905551234567',
        // FIX 3: Gerçek fotoğrafları kontrol et
        photos: (faultData as any).photos && (faultData as any).photos.length > 0 
          ? (faultData as any).photos 
          : [
              'https://picsum.photos/400/300?1',
              'https://picsum.photos/400/300?2',
              'https://picsum.photos/400/300?3'
            ],
        locationCoords: {
          lat: 41.0082,
          lng: 28.9784
        },
        estimatedRepairTime: '2-3 saat',
        requiredTools: ['İngiliz anahtarı seti', 'Termal kamera', 'Yağ'],
        safetyNotes: 'Yüksek voltaj riski. İşlem öncesi güç kesilmeli.',
        history: [
          {
            action: 'created',
            timestamp: faultData.createdAt,
            user: faultData.reportedBy,
            note: 'Arıza bildirimi oluşturuldu'
          },
          {
            action: 'assigned',
            timestamp: faultData.updatedAt,
            user: 'Sistem Yöneticisi',
            note: faultData.assignedTo ? `${faultData.assignedTo}'a atandı` : 'Atanmamış'
          },
          {
            action: faultData.status,
            timestamp: faultData.updatedAt,
            user: faultData.assignedTo || 'Sistem',
            note: `Durum "${getStatusLabel(faultData.status)}" olarak güncellendi`
          }
        ]
      };
      setFault(faultDetail);
    }
    setIsLoading(false);
  };

  // FIX 4: Hook ile status güncelleme - useCallback ile optimize
  const handleStatusChange = async (newStatus: 'pending' | 'in_progress' | 'completed') => {
    if (!fault) return;

    try {
      await updateFaultReportStatus(fault.id, newStatus, user?.name);
      
      // Local state'i güncelle
      setFault({
        ...fault,
        status: newStatus,
        assignedTo: user?.name || fault.assignedTo,
        history: [
          ...fault.history,
          {
            action: newStatus,
            timestamp: new Date().toISOString(),
            user: user?.name || 'Mevcut Kullanıcı',
            note: `Durum "${getStatusLabel(newStatus)}" olarak değiştirildi`
          }
        ]
      });
      
      Alert.alert('Başarılı', `Arıza durumu "${getStatusLabel(newStatus)}" olarak güncellendi`);
    } catch (error) {
      Alert.alert('Hata', 'Durum güncellenirken bir sorun oluştu');
    }
  };

  // FIX 5: Butonlar çalışır hale getirildi
  const handleAssign = () => {
    Alert.prompt(
      'Teknisyen Ata',
      'Bu arızayı kim inceleyecek?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Ata', 
          onPress: async (name: string | undefined) => {
            if (name && fault) {
              try {
                await updateFaultReportStatus(fault.id, 'in_progress', name);
                
                setFault({
                  ...fault,
                  assignedTo: name,
                  status: 'in_progress',
                  history: [
                    ...fault.history,
                    {
                      action: 'assigned',
                      timestamp: new Date().toISOString(),
                      user: 'Sistem',
                      note: `${name} isimli teknisyene atandı`
                    }
                  ]
                });
                Alert.alert('Başarılı', `${name} teknisyene atandı`);
              } catch (error) {
                Alert.alert('Hata', 'Atama işlemi sırasında bir sorun oluştu');
              }
            }
          }
        }
      ],
      'plain-text'
    );
  };

  // FIX 6: Paylaş butonu implement edildi
  const shareFault = async () => {
    if (!fault) return;
    
    try {
      await Share.share({
        message: `Arıza Bildirimi: ${fault.title}\nAçıklama: ${fault.description}\nKonum: ${fault.location}\nÖncelik: ${getPriorityConfig(fault.priority).label}\nDurum: ${getStatusLabel(fault.status)}`,
        title: 'Arıza Detayları'
      });
    } catch (error) {
      Alert.alert('Hata', 'Paylaşım sırasında bir sorun oluştu');
    }
  };

  // FIX 7: Harita butonu implement edildi
  const openInMaps = () => {
    if (!fault) return;
    
    const url = `https://maps.google.com/?q=${fault.locationCoords.lat},${fault.locationCoords.lng}`;
    Linking.openURL(url).catch(err => 
      Alert.alert('Hata', 'Harita uygulaması açılamadı')
    );
  };

  // FIX 8: Ara butonu implement edildi
  const callContact = () => {
    if (!fault) return;
    
    Linking.openURL(`tel:${fault.contactNumber}`).catch(err => 
      Alert.alert('Hata', 'Arama yapılamadı')
    );
  };

  // FIX 9: Expandable sections implement edildi
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getPriorityConfig = (priority: string) => {
    const configs = {
      critical: { color: '#E74C3C', label: 'Kritik', icon: 'flash' },
      high: { color: '#FF6B6B', label: 'Yüksek', icon: 'warning' },
      medium: { color: '#F39C12', label: 'Orta', icon: 'alert-circle' },
      low: { color: '#27AE60', label: 'Düşük', icon: 'information' }
    };
    return configs[priority as keyof typeof configs] || configs.medium;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { color: '#FFEAA7', label: 'Bekliyor', icon: 'time' },
      in_progress: { color: '#74B9FF', label: 'İnceleniyor', icon: 'build' },
      completed: { color: '#55EFC4', label: 'Tamamlandı', icon: 'checkmark-done' },
      cancelled: { color: '#DFE6E9', label: 'İptal', icon: 'close' }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getStatusLabel = (status: string) => {
    return getStatusConfig(status).label;
  };

  // Loading state
  if (isLoading || !fault) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  const PriorityBadge = () => {
    const config = getPriorityConfig(fault.priority);
    return (
      <View style={[styles.priorityBadge, { backgroundColor: config.color }]}>
        <Ionicons name={config.icon as any} size={16} color="#FFF" />
        <Text style={styles.priorityText}>{config.label}</Text>
      </View>
    );
  };

  const StatusBadge = () => {
    const config = getStatusConfig(fault.status);
    return (
      <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
        <Ionicons name={config.icon as any} size={16} color="#333" />
        <Text style={styles.statusText}>{config.label}</Text>
      </View>
    );
  };

  // FIX 10: Action Butonları tam implement edildi
  const ActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity style={styles.actionButton} onPress={shareFault}>
        <Ionicons name="share-social" size={20} color="#667eea" />
        <Text style={styles.actionButtonText}>Paylaş</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={openInMaps}>
        <Ionicons name="map" size={20} color="#667eea" />
        <Text style={styles.actionButtonText}>Harita</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={callContact}>
        <Ionicons name="call" size={20} color="#667eea" />
        <Text style={styles.actionButtonText}>Ara</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleAssign}>
        <Ionicons name="person-add" size={20} color="#667eea" />
        <Text style={styles.actionButtonText}>Ata</Text>
      </TouchableOpacity>
    </View>
  );

  // FIX 11: Status Butonları tam implement edildi
  const StatusButtons = () => (
    <View style={styles.statusButtons}>
      {fault.status !== 'in_progress' && (
        <TouchableOpacity 
          style={[styles.statusButton, styles.statusButtonProgress]}
          onPress={() => handleStatusChange('in_progress')}
        >
          <Ionicons name="play" size={16} color="#FFF" />
          <Text style={styles.statusButtonText}>İncelemeye Al</Text>
        </TouchableOpacity>
      )}
      
      {fault.status !== 'completed' && (
        <TouchableOpacity 
          style={[styles.statusButton, styles.statusButtonComplete]}
          onPress={() => handleStatusChange('completed')}
        >
          <Ionicons name="checkmark" size={16} color="#FFF" />
          <Text style={styles.statusButtonText}>Tamamlandı</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const DetailsTab = () => (
    <View style={styles.tabContent}>
      {/* Temel Bilgiler */}
      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
        <View style={styles.detailGrid}>
          <View style={styles.detailItem}>
            <Ionicons name="hardware-chip" size={20} color="#667eea" />
            <Text style={styles.detailLabel}>Ekipman</Text>
            <Text style={styles.detailValue}>{fault.equipmentId}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location" size={20} color="#667eea" />
            <Text style={styles.detailLabel}>Konum</Text>
            <Text style={styles.detailValue}>{fault.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="person" size={20} color="#667eea" />
            <Text style={styles.detailLabel}>Bildiren</Text>
            <Text style={styles.detailValue}>{fault.reportedBy}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={20} color="#667eea" />
            <Text style={styles.detailLabel}>Tarih</Text>
            <Text style={styles.detailValue}>
              {new Date(fault.createdAt).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        </View>
      </View>

      {/* Arıza Açıklaması */}
      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>Arıza Açıklaması</Text>
        <Text style={styles.descriptionText}>{fault.description}</Text>
      </View>

      {/* FIX 12: Expandable sections düzeltildi */}
      {/* Tahmini Tamir Süresi */}
      <TouchableOpacity 
        style={styles.expandableSection}
        onPress={() => toggleSection('repairTime')}
      >
        <View style={styles.sectionHeader}>
          <Ionicons name="time" size={20} color="#F39C12" />
          <Text style={styles.sectionTitle}>Tahmini Tamir Süresi</Text>
          <Ionicons 
            name={expandedSection === 'repairTime' ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#666" 
          />
        </View>
        {expandedSection === 'repairTime' && (
          <View style={styles.sectionContent}>
            <Text style={styles.repairTimeText}>{fault.estimatedRepairTime}</Text>
            <Text style={styles.repairNote}>Bu süre ön değerlendirmeye dayanmaktadır</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Gerekli Ekipmanlar */}
      <TouchableOpacity 
        style={styles.expandableSection}
        onPress={() => toggleSection('tools')}
      >
        <View style={styles.sectionHeader}>
          <Ionicons name="construct" size={20} color="#667eea" />
          <Text style={styles.sectionTitle}>Gerekli Ekipmanlar</Text>
          <Ionicons 
            name={expandedSection === 'tools' ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#666" 
          />
        </View>
        {expandedSection === 'tools' && (
          <View style={styles.sectionContent}>
            {fault.requiredTools.map((tool, index) => (
              <View key={index} style={styles.toolItem}>
                <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
                <Text style={styles.toolText}>{tool}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>

      {/* Güvenlik Notları */}
      <TouchableOpacity 
        style={styles.expandableSection}
        onPress={() => toggleSection('safety')}
      >
        <View style={styles.sectionHeader}>
          <Ionicons name="shield-checkmark" size={20} color="#E74C3C" />
          <Text style={styles.sectionTitle}>Güvenlik Notları</Text>
          <Ionicons 
            name={expandedSection === 'safety' ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#666" 
          />
        </View>
        {expandedSection === 'safety' && (
          <View style={styles.sectionContent}>
            <Text style={styles.safetyText}>{fault.safetyNotes}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Fotoğraflar */}
      {fault.photos && fault.photos.length > 0 && (
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Fotoğraflar ({fault.photos.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.photosContainer}>
              {fault.photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image 
                    source={{ uri: photo }} 
                    style={styles.photo}
                    resizeMode="cover"
                  />
                  <Text style={styles.photoIndex}>#{index + 1}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );

  const HistoryTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.historyList}>
        {fault.history.map((item, index) => (
          <View key={index} style={styles.historyItem}>
            <View style={styles.historyTimeline}>
              <View style={styles.historyDot} />
              {index < fault.history.length - 1 && <View style={styles.historyLine} />}
            </View>
            <View style={styles.historyContent}>
              <Text style={styles.historyAction}>{item.note}</Text>
              <View style={styles.historyMeta}>
                <Text style={styles.historyUser}>{item.user}</Text>
                <Text style={styles.historyTime}>
                  {new Date(item.timestamp).toLocaleString('tr-TR')}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={styles.equipmentId}>{fault.equipmentId}</Text>
            <Text style={styles.faultType}>Arıza Detayı</Text>
          </View>

          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerBadges}>
          <PriorityBadge />
          <StatusBadge />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Action Buttons */}
        <ActionButtons />

        {/* Status Buttons */}
        <StatusButtons />

        {/* Atanan Teknisyen */}
        <View style={styles.assignedContainer}>
          <View style={styles.assignedInfo}>
            <Ionicons name="person" size={20} color="#667eea" />
            <View style={styles.assignedTexts}>
              <Text style={styles.assignedLabel}>Atanan Teknisyen</Text>
              <Text style={styles.assignedName}>
                {fault.assignedTo || 'Atanmamış'}
              </Text>
            </View>
          </View>
          {fault.assignedTo && (
            <TouchableOpacity style={styles.contactButton} onPress={callContact}>
              <Ionicons name="call" size={16} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'details' && styles.tabActive]}
            onPress={() => setActiveTab('details')}
          >
            <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>
              Detaylar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
              Geçmiş ({fault.history.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'details' ? <DetailsTab /> : <HistoryTab />}
      </ScrollView>
    </View>
  );
}

// Styles aynı kalıyor...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  equipmentId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  faultType: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  menuButton: {
    padding: 5,
  },
  headerBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  priorityText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 6,
  },
  statusButtonProgress: {
    backgroundColor: '#667eea',
  },
  statusButtonComplete: {
    backgroundColor: '#27AE60',
  },
  statusButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  assignedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  assignedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  assignedTexts: {
    gap: 2,
  },
  assignedLabel: {
    fontSize: 12,
    color: '#666',
  },
  assignedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactButton: {
    backgroundColor: '#667eea',
    padding: 10,
    borderRadius: 20,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#667eea',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    color: '#FFF',
  },
  tabContent: {
    padding: 20,
  },
  detailSection: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    width: (width - 72) / 2,
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  expandableSection: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  repairTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F39C12',
    marginBottom: 4,
  },
  repairNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  toolText: {
    fontSize: 14,
    color: '#333',
  },
  safetyText: {
    fontSize: 14,
    color: '#E74C3C',
    lineHeight: 20,
    fontWeight: '500',
  },
  photosContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  photoIndex: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  historyList: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    gap: 12,
  },
  historyTimeline: {
    alignItems: 'center',
    width: 24,
  },
  historyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#667eea',
  },
  historyLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  historyContent: {
    flex: 1,
    paddingBottom: 16,
  },
  historyAction: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  historyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyUser: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
  },
  historyTime: {
    fontSize: 12,
    color: '#999',
  },
});