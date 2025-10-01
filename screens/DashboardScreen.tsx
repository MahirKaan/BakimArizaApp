// screens/DashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

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
}

interface QuickActionItem {
  id: number;
  title: string;
  icon: string;
  color: string;
  screen: string;
}

const STATS_CARDS: StatsCardItem[] = [
  { id: 1, title: 'Aktif Arızalar', value: '12', color: '#FF6B6B', icon: 'warning', change: '+2' },
  { id: 2, title: 'Bugünkü Bildirimler', value: '8', color: '#4ECDC4', icon: 'notifications', change: '-1' },
  { id: 3, title: 'Tamamlanan İşler', value: '23', color: '#45B7D1', icon: 'checkmark-done', change: '+5' },
  { id: 4, title: 'Ort. Yanıt Süresi', value: '2.3s', color: '#96CEB4', icon: 'time', change: '-0.5s' },
];

const QUICK_ACTIONS: QuickActionItem[] = [
  { id: 1, title: 'Hızlı Arıza Bildir', icon: 'add-circle', color: '#FF6B6B', screen: 'FaultReport' },
  { id: 2, title: 'Arıza Listesi', icon: 'list', color: '#4ECDC4', screen: 'FaultList' },
  { id: 3, title: 'Canlı Harita', icon: 'map', color: '#45B7D1', screen: 'Map' },
  { id: 4, title: 'Analizler', icon: 'analytics', color: '#764ba2', screen: 'Analytics' },
];

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState('technician'); // technician, manager, admin

  const onRefresh = () => {
    setRefreshing(true);
    // Refresh data
    setTimeout(() => setRefreshing(false), 2000);
  };

  const handleQuickAction = (screen: string) => {
    navigation.navigate(screen);
  };

  const CriticalAlert = () => (
    <TouchableOpacity style={styles.criticalAlert}>
      <View style={styles.alertIcon}>
        <Ionicons name="flash" size={20} color="#FFF" />
      </View>
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>KRİTİK ARIZA</Text>
        <Text style={styles.alertMessage}>Pompa istasyonu #P-12 acil müdahale gerekiyor</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#FFF" />
    </TouchableOpacity>
  );

  const StatsCard = ({ item }: { item: StatsCardItem }) => (
    <View style={styles.statsCard}>
      <View style={[styles.statsIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as any} size={20} color="#FFF" />
      </View>
      <Text style={styles.statsValue}>{item.value}</Text>
      <Text style={styles.statsTitle}>{item.title}</Text>
      <View style={styles.statsChange}>
        <Text style={[
          styles.changeText, 
          { color: item.change.includes('+') ? '#27AE60' : item.change.includes('-') ? '#E74C3C' : '#F39C12' }
        ]}>
          {item.change}
        </Text>
      </View>
    </View>
  );

  const QuickActionButton = ({ action }: { action: QuickActionItem }) => (
    <TouchableOpacity 
      style={styles.quickAction}
      onPress={() => handleQuickAction(action.screen)}
    >
      <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
        <Ionicons name={action.icon as any} size={24} color="#FFF" />
      </View>
      <Text style={styles.actionText}>{action.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Günaydın, Ahmet!</Text>
            <Text style={styles.date}>15 Şubat 2024, Perşembe</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={40} color="#667eea" />
          </TouchableOpacity>
        </View>

        {/* Critical Alert */}
        <CriticalAlert />

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {STATS_CARDS.map((item) => (
            <StatsCard key={item.id} item={item} />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <QuickActionButton key={action.id} action={action} />
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Aktivite</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityList}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="warning" size={16} color="#FF6B6B" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Vana arızası #V-{item}2</Text>
                  <Text style={styles.activityTime}>2 saat önce</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#FFEAA7' }]}>
                  <Text style={styles.statusText}>İnceleniyor</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Predictive Maintenance Alert */}
        <View style={styles.predictiveCard}>
          <View style={styles.predictiveHeader}>
            <Ionicons name="analytics" size={24} color="#667eea" />
            <Text style={styles.predictiveTitle}>Tahmini Bakım Önerisi</Text>
          </View>
          <Text style={styles.predictiveText}>
            Pompa #P-08 önümüzdeki 3 gün içinde bakım gerektirebilir
          </Text>
          <TouchableOpacity style={styles.predictiveButton}>
            <Text style={styles.predictiveButtonText}>Detayları Gör</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('FaultReport')}
      >
        <Ionicons name="add" size={24} color="#FFF" />
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  criticalAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  statsCard: {
    width: '50%',
    padding: 10,
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  statsTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statsChange: {
    marginTop: 4,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '600',
  },
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  seeAllText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  quickAction: {
    width: '50%',
    padding: 8,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    alignSelf: 'center',
  },
  actionText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
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
    backgroundColor: '#FFF5F5',
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
    color: '#333',
  },
  predictiveCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  predictiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  predictiveTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginLeft: 8,
  },
  predictiveText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  predictiveButton: {
    backgroundColor: '#667eea',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  predictiveButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
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