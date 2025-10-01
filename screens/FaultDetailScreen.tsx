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
          onPress: (name: string | undefined) => { // name parametresi type eklendi
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

// Styles kısmı aynı kalacak, buraya eklemiyorum çünkü çok uzun
// Sadece TypeScript hatalarını çözdük
const styles = StyleSheet.create({
  // ... Önceki styles objesi aynen kalacak
  // Bu kısım değişmediği için tekrar yazmıyorum
});