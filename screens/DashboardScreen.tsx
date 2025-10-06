// screens/DashboardScreen.tsx - KRİTİK ARIZA KARTI KALDIRILDI
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import useFaultReports from '../hooks/useFaultReports';

// Types tanımlamaları
interface DashboardScreenProps {
  navigation: any;
}

interface StatsCardItem {
  id: number;
  title: string;
  value: string;
  color: string;
  icon: string;
  change: string;
  role: string[];
  filter?: string;
}

interface QuickActionItem {
  id: number;
  title: string;
  icon: string;
  color: string;
  screen: string;
  role: string[];
}

interface ActivityItem {
  id: number;
  title: string;
  time: string;
  status: 'pending' | 'in-progress' | 'completed' | 'critical';
  type: 'fault' | 'maintenance' | 'inspection' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  faultId?: number;
}

const { width } = Dimensions.get('window');

// YENİ: FİLTRELER İÇİN CONSTANT'LAR
const FILTER_TYPES = {
  KRITIK: 'kritik',
  AKTIF: 'aktif',
  BUGUNKU: 'bugunku',
  ATANMIS: 'atanmis',
  TAMAMLANAN: 'tamamlanan',
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

// YENİ: GÜNCELLENMİŞ STATS KARTLARI - KRİTİK ARIZA KARTI KALDIRILDI
const STATS_CARDS: StatsCardItem[] = [
  { 
    id: 1, 
    title: 'Aktif Arızalar', 
    value: '0', 
    color: '#FF6B6B', 
    icon: 'warning', 
    change: '+0', 
    role: ['technician', 'manager', 'admin'],
    filter: FILTER_TYPES.AKTIF
  },
  { 
    id: 2, 
    title: 'Bugünkü Bildirimler', 
    value: '0', 
    color: '#4ECDC4', 
    icon: 'notifications', 
    change: '+0', 
    role: ['technician', 'manager', 'admin'],
    filter: FILTER_TYPES.BUGUNKU
  },
  { 
    id: 3, 
    title: 'Atanmış İşler', 
    value: '0', 
    color: '#45B7D1', 
    icon: 'briefcase', 
    change: '+0', 
    role: ['technician', 'manager', 'admin'],
    filter: FILTER_TYPES.ATANMIS
  },
  { 
    id: 4, 
    title: 'Tamamlanan İşler', 
    value: '0', 
    color: '#96CEB4', 
    icon: 'checkmark-done', 
    change: '+0', 
    role: ['technician', 'manager', 'admin'],
    filter: FILTER_TYPES.TAMAMLANAN
  },
];

// ROLE BAZLI HIZLI İŞLEMLER
const QUICK_ACTIONS: QuickActionItem[] = [
  { id: 1, title: 'Hızlı Arıza Bildir', icon: 'add-circle', color: '#FF6B6B', screen: 'FaultReport', role: ['technician', 'manager', 'admin'] },
  { id: 2, title: 'Arıza Listesi', icon: 'list', color: '#4ECDC4', screen: 'FaultList', role: ['technician', 'manager', 'admin'] },
  { id: 3, title: 'Stok Sorgula', icon: 'cube', color: '#45B7D1', screen: 'Inventory', role: ['technician', 'manager', 'admin'] },
];

// AKTİVİTE VERİSİ - MOCK (fallback için)
const ACTIVITY_DATA: ActivityItem[] = [
  { id: 1, title: 'Klima Arızası bildirildi', time: '2 gün önce', status: 'pending', type: 'fault', priority: 'high' },
  { id: 2, title: 'Su Kaçağı inceleniyor', time: '1 gün önce', status: 'in-progress', type: 'fault', priority: 'medium' },
];

// Bileşenleri dışarıda tanımla
const StatsCard = ({ item, onPress }: { item: StatsCardItem; onPress: (filter?: string) => void }) => (
  <TouchableOpacity 
    style={styles.statsCard}
    onPress={() => onPress(item.filter)}
    activeOpacity={0.7}
  >
    <LinearGradient
      colors={[item.color, `${item.color}DD`]}
      style={styles.statsGradient}
    >
      <View style={styles.statsHeader}>
        <Text style={styles.statsValue}>{item.value}</Text>
        <View style={styles.statsIcon}>
          <Ionicons name={item.icon as any} size={20} color="#FFF" />
        </View>
      </View>
      <Text style={styles.statsTitle}>{item.title}</Text>
      <View style={styles.statsChange}>
        <Text style={[
          styles.changeText, 
          { color: item.change.includes('+') ? '#27AE60' : '#E74C3C' }
        ]}>
          {item.change}
        </Text>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const QuickActionButton = ({ action, onPress }: { action: QuickActionItem; onPress: (screen: string) => void }) => (
  <TouchableOpacity 
    style={styles.quickAction}
    onPress={() => onPress(action.screen)}
    activeOpacity={0.7}
  >
    <LinearGradient
      colors={[action.color, `${action.color}DD`]}
      style={styles.actionGradient}
    >
      <Ionicons name={action.icon as any} size={24} color="#FFF" />
    </LinearGradient>
    <Text style={styles.actionText}>{action.title}</Text>
  </TouchableOpacity>
);

const ActivityItem = ({ item, onPress }: { item: ActivityItem; onPress: (item: ActivityItem) => void }) => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'critical': return '#FF4757';
      case 'in-progress': return '#2ED573';
      case 'completed': return '#1E90FF';
      case 'pending': return '#FFA502';
      default: return '#A4B0BE';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'critical': return 'flash';
      case 'high': return 'warning';
      case 'medium': return 'alert-circle';
      case 'low': return 'information-circle';
      default: return 'help-circle';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'in-progress': return 'Devam Ediyor';
      case 'completed': return 'Tamamlandı';
      case 'critical': return 'Kritik';
      default: return 'Bekliyor';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.activityItem}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.activityIcon, { backgroundColor: getStatusColor(item.status) }]}>
        <Ionicons name={getPriorityIcon(item.priority) as any} size={16} color="#FFF" />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activityTime}>{item.time}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
        <Text style={styles.statusText}>
          {getStatusText(item.status)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Kritik Alert bileşeni - AYNI KALDI
const CriticalAlert = ({ hasCriticalFaults, onPress }: { hasCriticalFaults: boolean; onPress: () => void }) => {
  if (!hasCriticalFaults) {
    return <View />;
  }
  
  return (
    <TouchableOpacity 
      style={styles.criticalAlert}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.alertIcon}>
        <Ionicons name="flash" size={20} color="#FFF" />
      </View>
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>KRİTİK ARIZA</Text>
        <Text style={styles.alertMessage}>Acil müdahale gereken kritik arızalar var</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#FFF" />
    </TouchableOpacity>
  );
};

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout, loading: authLoading } = useAuth();
  
  // Fault reports hook'u
  const { 
    faultReports, 
    loading: faultsLoading, 
    fetchFaultReports,
    getPendingReports,
    getInProgressReports,
    getCompletedReports
  } = useFaultReports();

  // YENİ: Dashboard istatistiklerini hesapla - KRİTİK ARIZA KARTI KALDIRILDI
  const calculateStats = () => {
    const pendingCount = getPendingReports().length;
    const inProgressCount = getInProgressReports().length;
    const completedCount = getCompletedReports().length;
    const criticalCount = faultReports.filter(f => f.priority === 'critical' && f.status !== 'completed').length;
    const assignedCount = faultReports.filter(f => f.assignedTo && f.assignedTo !== '').length;
    
    // Bugünkü bildirimler
    const today = new Date().toDateString();
    const todayCount = faultReports.filter(f => 
      new Date(f.createdAt).toDateString() === today
    ).length;
    
    // STATS_CARDS'i güncelle - KRİTİK ARIZA KARTI KALDIRILDI
    const updatedStats = STATS_CARDS.map(card => {
      switch(card.title) {
        case 'Aktif Arızalar':
          // Aktif = pending + in_progress (tamamlanmamışlar)
          const activeCount = pendingCount + inProgressCount;
          return { ...card, value: activeCount.toString(), change: activeCount > 0 ? `+${activeCount}` : '0' };
        case 'Bugünkü Bildirimler':
          return { ...card, value: todayCount.toString(), change: todayCount > 0 ? `+${todayCount}` : '0' };
        case 'Atanmış İşler':
          return { ...card, value: assignedCount.toString(), change: assignedCount > 0 ? `+${assignedCount}` : '0' };
        case 'Tamamlanan İşler':
          return { ...card, value: completedCount.toString(), change: completedCount > 0 ? `+${completedCount}` : '0' };
        default:
          return card;
      }
    });

    return updatedStats;
  };

  // YENİ: Aktivite verilerini fault reports'tan oluştur
  const getActivityData = () => {
    // En son 3 arızayı al
    const recentFaults = [...faultReports]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .map((fault, index) => {
        // Status mapping'i düzelt
        let activityStatus: 'pending' | 'in-progress' | 'completed' | 'critical';
        
        if (fault.status === 'completed') {
          activityStatus = 'completed';
        } else if (fault.status === 'in_progress') {
          activityStatus = 'in-progress';
        } else if (fault.priority === 'critical') {
          activityStatus = 'critical';
        } else {
          activityStatus = 'pending';
        }

        // Title'ı duruma göre oluştur
        let title = fault.title;
        if (fault.status === 'completed') {
          title = `${fault.title} tamamlandı`;
        } else if (fault.status === 'in_progress') {
          title = `${fault.title} inceleniyor`;
        } else {
          title = `${fault.title} bildirildi`;
        }

        return {
          id: fault.id,
          title: title,
          time: getTimeAgo(fault.createdAt),
          status: activityStatus,
          type: 'fault' as const,
          priority: fault.priority,
          faultId: fault.id
        };
      });

    return recentFaults.length > 0 ? recentFaults : ACTIVITY_DATA;
  };

  // YENİ: Zaman farkı hesaplama
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

  // Role göre filtreleme fonksiyonları
  const getFilteredStats = () => {
    const userRole = user?.role || 'technician';
    const stats = calculateStats();
    return stats.filter(card => card.role.includes(userRole));
  };

  const getFilteredActions = () => {
    const userRole = user?.role || 'technician';
    return QUICK_ACTIONS.filter(action => action.role.includes(userRole));
  };

  const getFilteredActivities = () => {
    if (user?.role === 'technician') {
      return getActivityData().filter(activity => activity.type !== 'system');
    }
    return getActivityData();
  };

  const hasCriticalFaults = faultReports.some(f => f.priority === 'critical' && f.status !== 'completed');

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFaultReports();
    setRefreshing(false);
  };

  // YENİ: Navigation handler'ları
  const handleQuickAction = (screen: string) => {
    navigation.navigate(screen);
  };

  const handleStatsCardPress = (filter?: string) => {
    navigation.navigate('FaultList', { filter });
  };

  const handleActivityPress = (activity: ActivityItem) => {
    if (activity.faultId) {
      navigation.navigate('FaultDetail', { faultId: activity.faultId });
    } else {
      navigation.navigate('FaultList');
    }
  };

  const handleCriticalAlertPress = () => {
    navigation.navigate('FaultList', { filter: FILTER_TYPES.KRITIK });
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Uygulamadan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.navigate('Login');
          }
        }
      ]
    );
  };

  const getRoleText = (role: string) => {
    switch(role) {
      case 'technician': return 'Teknisyen';
      case 'manager': return 'Yönetici';
      case 'admin': return 'Sistem Yöneticisi';
      default: return 'Kullanıcı';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi Günler';
    return 'İyi Akşamlar';
  };

  // İlk yükleme
  useEffect(() => {
    fetchFaultReports();
  }, []);

  if (authLoading || faultsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  const userRole = user?.role || 'technician';
  const filteredStats = getFilteredStats();
  const filteredActions = getFilteredActions();
  const filteredActivities = getFilteredActivities();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F8F9FF" barStyle="dark-content" />
      
      {/* Custom Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.headerGradient}>
        <View style={styles.customHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>
                {getGreeting()}, {user?.name || 'Kullanıcı'}!
              </Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {getRoleText(userRole)}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Critical Alert - AYNI KALDI */}
        <CriticalAlert 
          hasCriticalFaults={hasCriticalFaults} 
          onPress={handleCriticalAlertPress}
        />

        {/* Stats Grid - KRİTİK ARIZA KARTI KALDIRILDI */}
        <View style={styles.statsGrid}>
          {filteredStats.map((item) => (
            <StatsCard 
              key={item.id} 
              item={item} 
              onPress={handleStatsCardPress}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.quickActionsGrid}>
            {filteredActions.map((action) => (
              <QuickActionButton 
                key={action.id} 
                action={action} 
                onPress={handleQuickAction}
              />
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Aktivite</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('FaultList')}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityList}>
            {filteredActivities.map((item) => (
              <ActivityItem 
                key={item.id} 
                item={item} 
                onPress={handleActivityPress}
              />
            ))}
          </View>
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('FaultReport')}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

// Styles - AYNI KALDI
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bottomPadding: {
    height: 80,
  },
  // Header Styles
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 10,
  },
  roleText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  profileButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  criticalAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4757',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 16,
    borderRadius: 16,
  },
  alertIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 10,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  alertMessage: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    marginBottom: 20,
    marginTop: 10,
  },
  statsCard: {
    width: '50%',
    padding: 10,
    height: 120,
  },
  statsGradient: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
  },
  statsIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginTop: 8,
  },
  statsChange: {
    marginTop: 4,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  seeAllText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  quickAction: {
    width: '33.33%',
    padding: 6,
    alignItems: 'center',
  },
  actionGradient: {
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  // Activity List
  activityList: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});