// screens/FaultDetailScreen.tsx
import React, { useState } from 'react';
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

interface FaultDetail {
  id: string;
  equipmentId: string;
  description: string;
  priority: string;
  status: string;
  type: string;
  timestamp: string;
  location: string;
  assignedTo: string | null;
  reportedBy: string;
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

const FAULT_DETAIL: FaultDetail = {
  id: '1',
  equipmentId: 'PMP-001',
  description: 'Pompa aşırı ısınma sorunu. Motor sıcaklığı 95°C seviyelerine çıktı. Soğutma sisteminde yetersizlik tespit edildi. Acil müdahale gerekiyor. Soğutma fanları düzgün çalışmıyor ve yağ seviyesi düşük.',
  priority: 'high',
  status: 'in_progress',
  type: 'Mekanik',
  timestamp: '2024-02-15T10:30:00Z',
  location: 'İstasyon A - Pompa Odası',
  assignedTo: 'Ahmet Yılmaz',
  reportedBy: 'Mehmet Demir',
  contactNumber: '+905551234567',
  photos: [
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
      timestamp: '2024-02-15T10:30:00Z',
      user: 'Mehmet Demir',
      note: 'Arıza bildirimi oluşturuldu'
    },
    {
      action: 'assigned',
      timestamp: '2024-02-15T11:15:00Z', 
      user: 'Sistem Yöneticisi',
      note: 'Ahmet Yılmaz\'a atandı'
    },
    {
      action: 'in_progress',
      timestamp: '2024-02-15T11:30:00Z',
      user: 'Ahmet Yılmaz',
      note: 'İncelemeye alındı, ön değerlendirme yapıldı'
    },
    {
      action: 'note_added',
      timestamp: '2024-02-15T11:45:00Z',
      user: 'Ahmet Yılmaz',
      note: 'Soğutma fan motoru arızalı, yedek parça gerekiyor'
    }
  ]
};

export default function FaultDetailScreen({ navigation, route }: FaultDetailScreenProps) {
  const [fault, setFault] = useState<FaultDetail>(FAULT_DETAIL);
  const [activeTab, setActiveTab] = useState('details');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleStatusChange = (newStatus: string) => {
    setFault({
      ...fault,
      status: newStatus,
      history: [
        ...fault.history,
        {
          action: newStatus,
          timestamp: new Date().toISOString(),
          user: 'Ahmet Yılmaz',
          note: `Durum ${getStatusLabel(newStatus)} olarak değiştirildi`
        }
      ]
    });
    
    Alert.alert('Başarılı', `Arıza durumu "${getStatusLabel(newStatus)}" olarak güncellendi`);
  };

  const handleAssign = () => {
    Alert.prompt(
      'Teknisyen Ata',
      'Bu arızayı kim inceleyecek?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Ata', 
          onPress: (name: string | undefined) => {
            if (name) {
              setFault({
                ...fault,
                assignedTo: name,
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
            }
          }
        }
      ]
    );
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

  const shareFault = async () => {
    try {
      await Share.share({
        message: `Arıza Bildirimi: ${fault.equipmentId}\nAçıklama: ${fault.description}\nKonum: ${fault.location}\nÖncelik: ${getPriorityConfig(fault.priority).label}`,
        title: 'Arıza Detayları'
      });
    } catch (error) {
      Alert.alert('Hata', 'Paylaşım sırasında bir sorun oluştu');
    }
  };

  const openInMaps = () => {
    const url = `https://maps.google.com/?q=${fault.locationCoords.lat},${fault.locationCoords.lng}`;
    Linking.openURL(url);
  };

  const callContact = () => {
    Linking.openURL(`tel:${fault.contactNumber}`);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

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

      {fault.status !== 'cancelled' && (
        <TouchableOpacity 
          style={[styles.statusButton, styles.statusButtonCancel]}
          onPress={() => handleStatusChange('cancelled')}
        >
          <Ionicons name="close" size={16} color="#FFF" />
          <Text style={styles.statusButtonText}>İptal</Text>
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
              {new Date(fault.timestamp).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        </View>
      </View>

      {/* Arıza Açıklaması */}
      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>Arıza Açıklaması</Text>
        <Text style={styles.descriptionText}>{fault.description}</Text>
      </View>

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
      {fault.photos.length > 0 && (
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Fotoğraflar ({fault.photos.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.photosContainer}>
              {fault.photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo }} style={styles.photo} />
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
            <Text style={styles.faultType}>{fault.type} Arızası</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  equipmentId: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  faultType: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  menuButton: {
    padding: 8,
  },
  headerBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priorityText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECFF',
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#667eea',
    marginTop: 4,
    fontWeight: '500',
  },
  statusButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#FFF',
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  statusButtonProgress: {
    backgroundColor: '#74B9FF',
  },
  statusButtonComplete: {
    backgroundColor: '#55EFC4',
  },
  statusButtonCancel: {
    backgroundColor: '#E74C3C',
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
    padding: 16,
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  assignedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assignedTexts: {
    marginLeft: 12,
  },
  assignedLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  assignedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactButton: {
    backgroundColor: '#27AE60',
    padding: 8,
    borderRadius: 8,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
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
    fontWeight: '600',
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  expandableSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  sectionContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailItem: {
    width: '50%',
    padding: 8,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  repairTimeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F39C12',
    textAlign: 'center',
    marginBottom: 4,
  },
  repairNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  toolText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  safetyText: {
    fontSize: 14,
    color: '#E74C3C',
    lineHeight: 20,
    fontWeight: '500',
  },
  photosContainer: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  photoContainer: {
    position: 'relative',
    marginHorizontal: 4,
  },
  photo: {
    width: 120,
    height: 90,
    borderRadius: 8,
  },
  photoIndex: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  historyList: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  historyItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  historyTimeline: {
    alignItems: 'center',
    marginRight: 12,
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
    backgroundColor: '#E8ECFF',
    marginTop: 4,
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
    fontWeight: '600',
  },
  historyTime: {
    fontSize: 12,
    color: '#999',
  },
});