// screens/FaultListScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  Alert,
  Animated
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

// Types tanımlamaları
interface FaultListScreenProps {
  navigation: any;
}

interface FaultItem {
  id: string;
  equipmentId: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  type: string;
  timestamp: string;
  location: string;
  assignedTo: string | null;
  photos: string[];
}

interface PriorityConfig {
  [key: string]: {
    color: string;
    label: string;
    icon: string;
  };
}

interface StatusConfig {
  [key: string]: {
    color: string;
    label: string;
    icon: string;
  };
}

const FAULT_DATA: FaultItem[] = [
  {
    id: '1',
    equipmentId: 'PMP-001',
    description: 'Pompa aşırı ısınma sorunu',
    priority: 'high',
    status: 'pending',
    type: 'Mekanik',
    timestamp: '2024-02-15T10:30:00Z',
    location: 'İstasyon A',
    assignedTo: 'Ahmet Y.',
    photos: []
  },
  {
    id: '2',
    equipmentId: 'VLV-045',
    description: 'Vana sızıntısı tespit edildi',
    priority: 'medium',
    status: 'in_progress',
    type: 'Mekanik',
    timestamp: '2024-02-15T09:15:00Z',
    location: 'İstasyon B',
    assignedTo: 'Mehmet K.',
    photos: []
  },
  {
    id: '3', 
    equipmentId: 'ELC-112',
    description: 'Elektrik panosunda kısa devre',
    priority: 'critical',
    status: 'pending',
    type: 'Elektrik',
    timestamp: '2024-02-15T08:45:00Z',
    location: 'Ana Tesis',
    assignedTo: null,
    photos: []
  }
];

const PRIORITY_CONFIG: PriorityConfig = {
  critical: { color: '#E74C3C', label: 'Kritik', icon: 'flash' },
  high: { color: '#FF6B6B', label: 'Yüksek', icon: 'warning' },
  medium: { color: '#F39C12', label: 'Orta', icon: 'alert-circle' },
  low: { color: '#27AE60', label: 'Düşük', icon: 'information' }
};

const STATUS_CONFIG: StatusConfig = {
  pending: { color: '#FFEAA7', label: 'Bekliyor', icon: 'time' },
  in_progress: { color: '#74B9FF', label: 'İnceleniyor', icon: 'build' },
  completed: { color: '#55EFC4', label: 'Tamamlandı', icon: 'checkmark-done' },
  cancelled: { color: '#DFE6E9', label: 'İptal', icon: 'close' }
};

export default function FaultListScreen({ navigation }: FaultListScreenProps) {
  const [faults, setFaults] = useState<FaultItem[]>(FAULT_DATA);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState('timestamp');

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const filteredFaults = faults.filter(fault => {
    const matchesSearch = fault.equipmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         fault.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || fault.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || fault.status === filterStatus;
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const sortedFaults = [...filteredFaults].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder: { [key: string]: number } = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const handleSwipeRight = (faultId: string) => {
    Alert.alert(
      'Hızlı İşlem',
      'Bu arıza için ne yapmak istiyorsunuz?',
      [
        {
          text: 'Tamamlandı',
          onPress: () => markAsCompleted(faultId),
          style: 'default'
        },
        {
          text: 'İncelemeye Al',
          onPress: () => assignToMe(faultId),
          style: 'default'
        },
        {
          text: 'İptal',
          style: 'cancel'
        }
      ]
    );
  };

  const markAsCompleted = (faultId: string) => {
    setFaults(faults.map(fault => 
      fault.id === faultId ? { ...fault, status: 'completed' } : fault
    ));
  };

  const assignToMe = (faultId: string) => {
    setFaults(faults.map(fault => 
      fault.id === faultId ? { ...fault, status: 'in_progress', assignedTo: 'Ahmet Y.' } : fault
    ));
  };

  const PriorityFilter = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
      <TouchableOpacity 
        style={[styles.filterChip, filterPriority === 'all' && styles.filterChipActive]}
        onPress={() => setFilterPriority('all')}
      >
        <Text style={[styles.filterChipText, filterPriority === 'all' && styles.filterChipTextActive]}>
          Tümü
        </Text>
      </TouchableOpacity>
      
      {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
        <TouchableOpacity 
          key={key}
          style={[
            styles.filterChip, 
            { borderColor: config.color },
            filterPriority === key && styles.filterChipActive
          ]}
          onPress={() => setFilterPriority(key)}
        >
          <Ionicons name={config.icon as any} size={16} color={filterPriority === key ? '#FFF' : config.color} />
          <Text style={[
            styles.filterChipText, 
            filterPriority === key && styles.filterChipTextActive
          ]}>
            {config.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const StatusFilter = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
      <TouchableOpacity 
        style={[styles.filterChip, filterStatus === 'all' && styles.filterChipActive]}
        onPress={() => setFilterStatus('all')}
      >
        <Text style={[styles.filterChipText, filterStatus === 'all' && styles.filterChipTextActive]}>
          Tüm Durumlar
        </Text>
      </TouchableOpacity>
      
      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
        <TouchableOpacity 
          key={key}
          style={[
            styles.filterChip,
            { backgroundColor: filterStatus === key ? config.color : '#F8F9FA' }
          ]}
          onPress={() => setFilterStatus(key)}
        >
          <Ionicons name={config.icon as any} size={16} color={filterStatus === key ? '#333' : '#666'} />
          <Text style={[
            styles.filterChipText,
            { color: filterStatus === key ? '#333' : '#666' }
          ]}>
            {config.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const FaultCard = ({ fault }: { fault: FaultItem }) => {
    const priorityConfig = PRIORITY_CONFIG[fault.priority];
    const statusConfig = STATUS_CONFIG[fault.status];

    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
      const scale = dragX.interpolate({
        inputRange: [-100, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      });

      return (
        <TouchableOpacity 
          style={styles.swipeAction}
          onPress={() => handleSwipeRight(fault.id)}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name="build" size={24} color="#FFF" />
            <Text style={styles.swipeActionText}>İşlem</Text>
          </Animated.View>
        </TouchableOpacity>
      );
    };

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity 
          style={styles.faultCard}
          onPress={() => navigation.navigate('FaultDetail', { faultId: fault.id })}
        >
          <View style={styles.cardHeader}>
            <View style={styles.equipmentInfo}>
              <Text style={styles.equipmentId}>{fault.equipmentId}</Text>
              <Text style={styles.location}>{fault.location}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.color }]}>
              <Ionicons name={priorityConfig.icon as any} size={12} color="#FFF" />
              <Text style={styles.priorityText}>{priorityConfig.label}</Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {fault.description}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.faultMeta}>
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
                <Text style={styles.statusText}>{statusConfig.label}</Text>
              </View>
              <Text style={styles.timestamp}>
                {new Date(fault.timestamp).toLocaleDateString('tr-TR')}
              </Text>
            </View>

            <View style={styles.assignedInfo}>
              {fault.assignedTo ? (
                <>
                  <Ionicons name="person" size={14} color="#666" />
                  <Text style={styles.assignedText}>{fault.assignedTo}</Text>
                </>
              ) : (
                <Text style={styles.unassignedText}>Atanmamış</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Ekipman veya açıklama ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.sortButton}>
          <Ionicons name="filter" size={24} color="#667eea" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView 
        style={styles.filtersContainer}
        horizontal={false}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.filterTitle}>Öncelik</Text>
        <PriorityFilter />
        
        <Text style={styles.filterTitle}>Durum</Text>
        <StatusFilter />

        {/* Results */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            {sortedFaults.length} Arıza Bulundu
          </Text>
          <TouchableOpacity 
            style={styles.newFaultButton}
            onPress={() => navigation.navigate('FaultReport')}
          >
            <Ionicons name="add" size={16} color="#FFF" />
            <Text style={styles.newFaultText}>Yeni Arıza</Text>
          </TouchableOpacity>
        </View>

        {/* Fault List */}
        <ScrollView 
          style={styles.faultsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {sortedFaults.map((fault) => (
            <FaultCard key={fault.id} fault={fault} />
          ))}
          
          {sortedFaults.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#CCC" />
              <Text style={styles.emptyStateTitle}>Arıza bulunamadı</Text>
              <Text style={styles.emptyStateText}>
                Arama kriterlerinize uygun arıza kaydı bulunamadı
              </Text>
            </View>
          )}
        </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECFF',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  sortButton: {
    padding: 8,
  },
  filtersContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  filterScroll: {
    marginHorizontal: -4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#667eea',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  newFaultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newFaultText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  faultsList: {
    flex: 1,
  },
  faultCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: '#666',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
  },
  assignedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assignedText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  unassignedText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  swipeAction: {
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 16,
    marginBottom: 12,
    marginLeft: 8,
  },
  swipeActionText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});