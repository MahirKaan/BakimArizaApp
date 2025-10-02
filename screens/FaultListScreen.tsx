// screens/FaultListScreen.tsx - MOCK ENTEGRELİ TAM HAL
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  Alert,
  Animated,
  StatusBar,
  Platform,
  Dimensions,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import useFaultReports, { FaultReport } from '../hooks/useFaultReports';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// Types tanımlamaları
interface FaultListScreenProps {
  navigation: any;
}

interface PriorityConfig {
  [key: string]: {
    color: string;
    label: string;
    icon: string;
    gradient: readonly [string, string];
  };
}

interface StatusConfig {
  [key: string]: {
    color: string;
    label: string;
    icon: string;
    actionText: string;
  };
}

const PRIORITY_CONFIG: PriorityConfig = {
  critical: { 
    color: '#E74C3C', 
    label: 'Kritik', 
    icon: 'flash',
    gradient: ['#E74C3C', '#C0392B'] as const
  },
  high: { 
    color: '#FF6B6B', 
    label: 'Yüksek', 
    icon: 'warning',
    gradient: ['#FF6B6B', '#FF4757'] as const
  },
  medium: { 
    color: '#F39C12', 
    label: 'Orta', 
    icon: 'alert-circle',
    gradient: ['#F39C12', '#E67E22'] as const
  },
  low: { 
    color: '#27AE60', 
    label: 'Düşük', 
    icon: 'information-circle',
    gradient: ['#27AE60', '#2ECC71'] as const
  }
};

const STATUS_CONFIG: StatusConfig = {
  pending: { 
    color: '#FFEAA7', 
    label: 'Bekliyor', 
    icon: 'time',
    actionText: 'İncelemeye Al'
  },
  in_progress: { 
    color: '#74B9FF', 
    label: 'İnceleniyor', 
    icon: 'build',
    actionText: 'Tamamlandı İşaretle'
  },
  completed: { 
    color: '#55EFC4', 
    label: 'Tamamlandı', 
    icon: 'checkmark-done',
    actionText: 'Tekrar Aç'
  },
  cancelled: { 
    color: '#DFE6E9', 
    label: 'İptal', 
    icon: 'close',
    actionText: 'Yeniden Aktif Et'
  }
};

export default function FaultListScreen({ navigation }: FaultListScreenProps) {
  const { user } = useAuth();
  
  // YENİ: useFaultReports hook'unu kullan
  const {
    faultReports,
    loading,
    error,
    fetchFaultReports,
    addFaultReport,
    updateFaultReportStatus,
    deleteFaultReport,
    getPendingReports,
    getInProgressReports,
    getCompletedReports,
  } = useFaultReports();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFault, setSelectedFault] = useState<FaultReport | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  // Animations
  const filterAnim = useRef(new Animated.Value(0)).current;
  const actionSheetAnim = useRef(new Animated.Value(0)).current;

  // Swipeable referansları
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  // Ref fonksiyonu - useCallback ile optimize
  const setSwipeableRef = useCallback((faultId: string) => (ref: Swipeable | null) => {
    swipeableRefs.current[faultId] = ref;
  }, []);

  // YENİ: FaultReport tipine uygun filtreleme
  const { filteredFaults, sortedFaults } = useMemo(() => {
    const filtered = faultReports.filter(fault => {
      const matchesSearch = 
        fault.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fault.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fault.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fault.reportedBy.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPriority = filterPriority === 'all' || fault.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || fault.status === filterStatus;
      
      return matchesSearch && matchesPriority && matchesStatus;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder: { [key: string]: number } = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return { filteredFaults: filtered, sortedFaults: sorted };
  }, [faultReports, searchQuery, filterPriority, filterStatus, sortBy]);

  // İstatistikler - useMemo ile optimize
  const stats = useMemo(() => ({
    total: faultReports.length,
    pending: getPendingReports().length,
    inProgress: getInProgressReports().length,
    completed: getCompletedReports().length,
    critical: faultReports.filter(f => f.priority === 'critical').length,
  }), [faultReports, getPendingReports, getInProgressReports, getCompletedReports]);

  useEffect(() => {
    Animated.timing(filterAnim, {
      toValue: showFilters ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showFilters]);

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // YENİ: Hook'un fetch fonksiyonunu kullan
    await fetchFaultReports();
    
    setRefreshing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // YENİ: faultId'yi number olarak değiştirdim
  const handleQuickAction = (faultId: number, action: string) => {
    swipeableRefs.current[faultId.toString()]?.close();
    
    switch (action) {
      case 'assign':
        assignToMe(faultId);
        break;
      case 'complete':
        markAsCompleted(faultId);
        break;
      case 'details':
        navigation.navigate('FaultDetail', { faultId });
        break;
    }
  };

  const handleSwipeRight = (fault: FaultReport) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedFault(fault);
    setShowActionSheet(true);
    
    Animated.timing(actionSheetAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // YENİ: Hook'un update fonksiyonunu kullan ve faultId'yi number yap
  const markAsCompleted = async (faultId: number) => {
    try {
      await updateFaultReportStatus(faultId, 'completed', user?.name || 'Mevcut Kullanıcı');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert('Hata', 'Arıza tamamlanırken bir hata oluştu');
    }
  };

  // YENİ: Hook'un update fonksiyonunu kullan ve faultId'yi number yap
  const assignToMe = async (faultId: number) => {
    try {
      await updateFaultReportStatus(faultId, 'in_progress', user?.name || 'Mevcut Kullanıcı');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert('Hata', 'Arıza üstlenilirken bir hata oluştu');
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} sa önce`;
    return `${diffDays} gün önce`;
  };

  const getDurationText = (fault: FaultReport) => {
    return '30 dk';
  };

  const PriorityFilter = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
      <TouchableOpacity 
        style={[styles.filterChip, filterPriority === 'all' && styles.filterChipActive]}
        onPress={() => {
          setFilterPriority('all');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
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
            filterPriority === key && { backgroundColor: config.color }
          ]}
          onPress={() => {
            setFilterPriority(key);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
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
        onPress={() => {
          setFilterStatus('all');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
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
            { borderColor: config.color },
            filterStatus === key && { backgroundColor: config.color }
          ]}
          onPress={() => {
            setFilterStatus(key);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Ionicons name={config.icon as any} size={16} color={filterStatus === key ? '#333' : config.color} />
          <Text style={[
            styles.filterChipText,
            { color: filterStatus === key ? '#333' : config.color }
          ]}>
            {config.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const QuickActionButton = React.memo(({ icon, label, color, onPress }: any) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={20} color="#FFF" />
      </View>
      <Text style={styles.quickActionText}>{label}</Text>
    </TouchableOpacity>
  ));

  const FaultCard = React.memo(({ fault }: { fault: FaultReport }) => {
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
          style={[styles.swipeAction, { backgroundColor: priorityConfig.color }]}
          onPress={() => handleSwipeRight(fault)}
        >
          <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#FFF" />
            <Text style={styles.swipeActionText}>Seçenekler</Text>
          </Animated.View>
        </TouchableOpacity>
      );
    };

    return (
      <Swipeable 
        ref={setSwipeableRef(fault.id.toString())}
        renderRightActions={renderRightActions}
        friction={2}
        rightThreshold={40}
        overshootRight={false}
      >
        <TouchableOpacity 
          style={styles.faultCard}
          onPress={() => navigation.navigate('FaultDetail', { faultId: fault.id })}
          activeOpacity={0.7}
        >
          {/* Priority Indicator */}
          <View style={[styles.priorityIndicator, { backgroundColor: priorityConfig.color }]} />
          
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.equipmentInfo}>
                <View style={styles.equipmentRow}>
                  <Text style={styles.equipmentId}>{fault.title}</Text>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>Arıza</Text>
                  </View>
                </View>
                <Text style={styles.location}>
                  <Ionicons name="location" size={12} color="#666" /> {fault.location}
                </Text>
              </View>
              <View style={styles.priorityBadge}>
                <LinearGradient
                  colors={priorityConfig.gradient}
                  style={styles.priorityGradient}
                >
                  <Ionicons name={priorityConfig.icon as any} size={12} color="#FFF" />
                  <Text style={styles.priorityText}>{priorityConfig.label}</Text>
                </LinearGradient>
              </View>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {fault.description}
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="time" size={12} color="#666" />
                <Text style={styles.statText}>{getDurationText(fault)}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.faultMeta}>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
                  <Ionicons name={statusConfig.icon as any} size={12} color="#333" />
                  <Text style={styles.statusText}>{statusConfig.label}</Text>
                </View>
                <Text style={styles.timestamp}>
                  {getTimeAgo(fault.createdAt)}
                </Text>
              </View>

              <View style={styles.assignedInfo}>
                {fault.assignedTo ? (
                  <>
                    <Ionicons name="person" size={14} color="#667eea" />
                    <Text style={styles.assignedText}>{fault.assignedTo}</Text>
                  </>
                ) : (
                  <Text style={styles.unassignedText}>
                    <Ionicons name="person-outline" size={14} color="#999" />
                    {' '}Atanmamış
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.reportedBy}>
              <Text style={styles.reportedByText}>
                <Ionicons name="person-circle" size={12} color="#888" />
                {' '}Bildiren: {fault.reportedBy}
              </Text>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsRow}>
              {fault.status === 'pending' && (
                <QuickActionButton
                  icon="person-add"
                  label="Üstlen"
                  color="#667eea"
                  onPress={() => handleQuickAction(fault.id, 'assign')}
                />
              )}
              {fault.status === 'in_progress' && (
                <QuickActionButton
                  icon="checkmark-done"
                  label="Tamamla"
                  color="#27AE60"
                  onPress={() => handleQuickAction(fault.id, 'complete')}
                />
              )}
              <QuickActionButton
                icon="eye"
                label="Detay"
                color="#F39C12"
                onPress={() => handleQuickAction(fault.id, 'details')}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  });

  const closeActionSheet = () => {
    Animated.timing(actionSheetAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowActionSheet(false);
      setSelectedFault(null);
    });
  };

  // YENİ: Error durumu için
  if (error && !loading) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#667eea" barStyle="light-content" />
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradientHeader}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Arıza Listesi</Text>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.centerContent}>
          <Ionicons name="warning" size={64} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Hata Oluştu</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchFaultReports}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#667eea" barStyle="light-content" />
      
      {/* Custom Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradientHeader}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Arıza Listesi</Text>
            <Text style={styles.headerSubtitle}>
              {stats.total} kayıt • {stats.pending} bekliyor • {stats.critical} kritik
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.filterToggle}
              onPress={() => {
                setShowFilters(!showFilters);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons name={showFilters ? "filter" : "filter-outline"} size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#667eea" />
          <TextInput
            style={styles.searchInput}
            placeholder="Başlık, açıklama, konum veya bildiren ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#667eea" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Filters Section */}
      <Animated.View 
        style={[
          styles.filtersPanel,
          {
            height: filterAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 280]
            }),
            opacity: filterAnim
          }
        ]}
      >
        <ScrollView style={styles.filtersContent}>
          <Text style={styles.filtersTitle}>Filtreler</Text>
          
          <Text style={styles.filterSectionTitle}>Öncelik</Text>
          <PriorityFilter />
          
          <Text style={styles.filterSectionTitle}>Durum</Text>
          <StatusFilter />

          {/* Sort Options */}
          <Text style={styles.filterSectionTitle}>Sırala</Text>
          <View style={styles.sortOptions}>
            <TouchableOpacity 
              style={[styles.sortOption, sortBy === 'timestamp' && styles.sortOptionActive]}
              onPress={() => {
                setSortBy('timestamp');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons name="time" size={16} color={sortBy === 'timestamp' ? '#FFF' : '#666'} />
              <Text style={[styles.sortOptionText, sortBy === 'timestamp' && styles.sortOptionTextActive]}>
                Tarihe Göre
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sortOption, sortBy === 'priority' && styles.sortOptionActive]}
              onPress={() => {
                setSortBy('priority');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons name="flag" size={16} color={sortBy === 'priority' ? '#FFF' : '#666'} />
              <Text style={[styles.sortOptionText, sortBy === 'priority' && styles.sortOptionTextActive]}>
                Önceliğe Göre
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sortOption, sortBy === 'title' && styles.sortOptionActive]}
              onPress={() => {
                setSortBy('title');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons name="business" size={16} color={sortBy === 'title' ? '#FFF' : '#666'} />
              <Text style={[styles.sortOptionText, sortBy === 'title' && styles.sortOptionTextActive]}>
                Başlığa Göre
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Results and List */}
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <View>
            <Text style={styles.resultsTitle}>
              {sortedFaults.length} Arıza Bulundu
            </Text>
            <Text style={styles.resultsSubtitle}>
              {stats.pending} aktif • {stats.completed} tamamlandı
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.newFaultButton}
            onPress={() => navigation.navigate('FaultReport')}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.newFaultGradient}
            >
              <Ionicons name="add" size={16} color="#FFF" />
              <Text style={styles.newFaultText}>Yeni Arıza</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Fault List */}
        <FlatList
          data={sortedFaults}
          renderItem={({ item }) => <FaultCard fault={item} />}
          keyExtractor={item => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.faultsListContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#CCC" />
              <Text style={styles.emptyStateTitle}>Arıza bulunamadı</Text>
              <Text style={styles.emptyStateText}>
                Arama kriterlerinize uygun arıza kaydı bulunamadı
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => {
                  setSearchQuery('');
                  setFilterPriority('all');
                  setFilterStatus('all');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={styles.emptyStateButtonText}>Filtreleri Temizle</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* Action Sheet */}
      <Modal
        visible={showActionSheet}
        transparent
        animationType="none"
        onRequestClose={closeActionSheet}
      >
        <TouchableOpacity 
          style={styles.actionSheetOverlay}
          activeOpacity={1}
          onPress={closeActionSheet}
        >
          <Animated.View 
            style={[
              styles.actionSheet,
              {
                transform: [{
                  translateY: actionSheetAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0]
                  })
                }]
              }
            ]}
          >
            <View style={styles.actionSheetHeader}>
              <Text style={styles.actionSheetTitle}>
                {selectedFault?.title}
              </Text>
              <Text style={styles.actionSheetSubtitle}>
                {selectedFault?.description}
              </Text>
            </View>

            <View style={styles.actionSheetActions}>
              {selectedFault?.status === 'pending' && (
                <TouchableOpacity 
                  style={styles.actionSheetButton}
                  onPress={() => {
                    assignToMe(selectedFault.id);
                    closeActionSheet();
                  }}
                >
                  <Ionicons name="person-add" size={24} color="#667eea" />
                  <Text style={styles.actionSheetButtonText}>Üstlen</Text>
                </TouchableOpacity>
              )}
              
              {selectedFault?.status === 'in_progress' && (
                <TouchableOpacity 
                  style={styles.actionSheetButton}
                  onPress={() => {
                    markAsCompleted(selectedFault.id);
                    closeActionSheet();
                  }}
                >
                  <Ionicons name="checkmark-done" size={24} color="#27AE60" />
                  <Text style={styles.actionSheetButtonText}>Tamamla</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={styles.actionSheetButton}
                onPress={() => {
                  navigation.navigate('FaultDetail', { faultId: selectedFault?.id });
                  closeActionSheet();
                }}
              >
                <Ionicons name="eye" size={24} color="#F39C12" />
                <Text style={styles.actionSheetButtonText}>Detayları Gör</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionSheetButton, styles.actionSheetButtonCancel]}
                onPress={closeActionSheet}
              >
                <Ionicons name="close" size={24} color="#666" />
                <Text style={[styles.actionSheetButtonText, styles.actionSheetButtonTextCancel]}>
                  İptal
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      )}
    </View>
  );
}

// Styles aynı kalıyor...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  gradientHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterToggle: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  filtersPanel: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECFF',
    overflow: 'hidden',
  },
  filtersContent: {
    padding: 20,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 12,
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
  },
  filterChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  sortOptions: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  sortOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E8ECFF',
  },
  sortOptionActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  sortOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
  },
  sortOptionTextActive: {
    color: '#FFF',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  resultsSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  newFaultButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  newFaultGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  newFaultText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  faultsListContent: {
    paddingBottom: 20,
  },
  faultCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    flexDirection: 'row',
  },
  priorityIndicator: {
    width: 6,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardContent: {
    flex: 1,
    padding: 16,
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
  equipmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  equipmentId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginRight: 8,
  },
  typeBadge: {
    backgroundColor: '#E8ECFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#667eea',
  },
  location: {
    fontSize: 12,
    color: '#666',
  },
  priorityBadge: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  priorityGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  faultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
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
    color: '#667eea',
    marginLeft: 4,
    fontWeight: '500',
  },
  unassignedText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  reportedBy: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
    marginBottom: 8,
  },
  reportedByText: {
    fontSize: 10,
    color: '#888',
    fontStyle: 'italic',
  },
  quickActionsRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    marginHorizontal: 4,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  swipeAction: {
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
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  actionSheetHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  actionSheetSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionSheetActions: {
    padding: 20,
  },
  actionSheetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionSheetButtonCancel: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  actionSheetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  actionSheetButtonTextCancel: {
    color: '#666',
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
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248,249,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E74C3C',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});