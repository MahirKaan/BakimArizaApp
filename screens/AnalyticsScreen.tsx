// screens/AnalyticsScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Share,
  Alert
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

// Types tanımlamaları
interface AnalyticsScreenProps {
  navigation: any; // Navigation prop type
}

interface PriorityData {
  name: string;
  count: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

interface FaultTypeData {
  type: string;
  count: number;
  color: string;
}

interface TechnicianData {
  name: string;
  completed: number;
  efficiency: number;
  avgTime: string;
}

interface EquipmentHealthData {
  name: string;
  health: number;
  lastMaintenance: string;
}

const ANALYTICS_DATA = {
  summary: {
    totalFaults: 156,
    resolvedFaults: 128,
    avgResolutionTime: '2.3s',
    availabilityRate: '98.7%'
  },
  priorityDistribution: [
    { name: 'Kritik', count: 12, color: '#E74C3C', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Yüksek', count: 34, color: '#FF6B6B', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Orta', count: 67, color: '#F39C12', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Düşük', count: 43, color: '#27AE60', legendFontColor: '#7F7F7F', legendFontSize: 12 },
  ],
  faultTypes: [
    { type: 'Mekanik', count: 78, color: '#FF6B6B' },
    { type: 'Elektrik', count: 45, color: '#4ECDC4' },
    { type: 'Yazılım', count: 23, color: '#45B7D1' },
    { type: 'Diğer', count: 10, color: '#96CEB4' },
  ],
  monthlyTrend: {
    labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'],
    datasets: [
      {
        data: [65, 59, 80, 81, 56, 55],
        color: () => '#667eea',
        strokeWidth: 2
      }
    ]
  },
  technicianPerformance: [
    { name: 'Ahmet Y.', completed: 45, efficiency: 95, avgTime: '1.8s' },
    { name: 'Mehmet K.', completed: 38, efficiency: 92, avgTime: '2.1s' },
    { name: 'Ayşe D.', completed: 32, efficiency: 88, avgTime: '2.4s' },
    { name: 'Ali V.', completed: 28, efficiency: 85, avgTime: '2.7s' },
  ],
  equipmentHealth: [
    { name: 'PMP-001', health: 95, lastMaintenance: '2024-01-15' },
    { name: 'VLV-045', health: 82, lastMaintenance: '2024-01-20' },
    { name: 'ELC-112', health: 78, lastMaintenance: '2024-02-01' },
    { name: 'MTR-023', health: 65, lastMaintenance: '2024-02-05' },
    { name: 'CNT-067', health: 91, lastMaintenance: '2024-01-28' },
  ]
};

const chartConfig = {
  backgroundGradientFrom: '#FFF',
  backgroundGradientTo: '#FFF',
  color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#667eea'
  }
};

export default function AnalyticsScreen({ navigation }: AnalyticsScreenProps) {
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleShareReport = async () => {
    try {
      await Share.share({
        message: `Bakım Analiz Raporu\nToplam Arıza: ${ANALYTICS_DATA.summary.totalFaults}\nÇözülen: ${ANALYTICS_DATA.summary.resolvedFaults}\nOrtalama Çözüm Süresi: ${ANALYTICS_DATA.summary.avgResolutionTime}\nErişilebilirlik Oranı: ${ANALYTICS_DATA.summary.availabilityRate}`,
        title: 'Analiz Raporu'
      });
    } catch (error) {
      Alert.alert('Hata', 'Rapor paylaşılırken bir sorun oluştu');
    }
  };

  const handleExport = () => {
    Alert.alert('Dışa Aktar', 'Rapor hangi formatta aktarılsın?', [
      { text: 'PDF', onPress: () => exportAsPDF() },
      { text: 'Excel', onPress: () => exportAsExcel() },
      { text: 'İptal', style: 'cancel' }
    ]);
  };

  const exportAsPDF = () => {
    Alert.alert('Başarılı', 'PDF raporu oluşturuldu');
  };

  const exportAsExcel = () => {
    Alert.alert('Başarılı', 'Excel dosyası oluşturuldu');
  };

  const SummaryCards = () => (
    <View style={styles.summaryGrid}>
      <View style={styles.summaryCard}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.summaryGradient}>
          <Ionicons name="warning" size={24} color="#FFF" />
          <Text style={styles.summaryNumber}>{ANALYTICS_DATA.summary.totalFaults}</Text>
          <Text style={styles.summaryLabel}>Toplam Arıza</Text>
        </LinearGradient>
      </View>

      <View style={styles.summaryCard}>
        <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.summaryGradient}>
          <Ionicons name="checkmark-done" size={24} color="#FFF" />
          <Text style={styles.summaryNumber}>{ANALYTICS_DATA.summary.resolvedFaults}</Text>
          <Text style={styles.summaryLabel}>Çözülen</Text>
        </LinearGradient>
      </View>

      <View style={styles.summaryCard}>
        <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.summaryGradient}>
          <Ionicons name="time" size={24} color="#FFF" />
          <Text style={styles.summaryNumber}>{ANALYTICS_DATA.summary.avgResolutionTime}</Text>
          <Text style={styles.summaryLabel}>Ort. Çözüm Süresi</Text>
        </LinearGradient>
      </View>

      <View style={styles.summaryCard}>
        <LinearGradient colors={['#96CEB4', '#7BC6A8']} style={styles.summaryGradient}>
          <Ionicons name="trending-up" size={24} color="#FFF" />
          <Text style={styles.summaryNumber}>{ANALYTICS_DATA.summary.availabilityRate}</Text>
          <Text style={styles.summaryLabel}>Erişilebilirlik</Text>
        </LinearGradient>
      </View>
    </View>
  );

  const PriorityChart = () => (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Öncelik Dağılımı</Text>
        <Ionicons name="pie-chart" size={20} color="#667eea" />
      </View>
      <PieChart
        data={ANALYTICS_DATA.priorityDistribution}
        width={width - 80}
        height={140}
        chartConfig={chartConfig}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );

  const TrendChart = () => (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Aylık Arıza Trendi</Text>
        <Ionicons name="analytics" size={20} color="#667eea" />
      </View>
      <LineChart
        data={ANALYTICS_DATA.monthlyTrend}
        width={width - 80}
        height={160}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
    </View>
  );

  const FaultTypeChart = () => (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Arıza Tipi Dağılımı</Text>
        <Ionicons name="bar-chart" size={20} color="#667eea" />
      </View>
      <BarChart
        data={{
          labels: ANALYTICS_DATA.faultTypes.map(item => item.type),
          datasets: [{
            data: ANALYTICS_DATA.faultTypes.map(item => item.count)
          }]
        }}
        width={width - 80}
        height={160}
        yAxisLabel="" // Eksik property'ler eklendi
        yAxisSuffix="" // Eksik property'ler eklendi
        chartConfig={chartConfig}
        showValuesOnTopOfBars
        style={styles.chart}
      />
    </View>
  );

  const TechnicianPerformance = () => (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Teknisyen Performansı</Text>
        <Ionicons name="person" size={20} color="#667eea" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.performanceGrid}>
          {ANALYTICS_DATA.technicianPerformance.map((tech, index) => (
            <View key={index} style={styles.techCard}>
              <View style={styles.techHeader}>
                <Text style={styles.techName}>{tech.name}</Text>
                <View style={[
                  styles.efficiencyBadge,
                  { backgroundColor: tech.efficiency >= 90 ? '#27AE60' : tech.efficiency >= 80 ? '#F39C12' : '#E74C3C' }
                ]}>
                  <Text style={styles.efficiencyText}>%{tech.efficiency}</Text>
                </View>
              </View>
              <View style={styles.techStats}>
                <View style={styles.techStat}>
                  <Text style={styles.techStatNumber}>{tech.completed}</Text>
                  <Text style={styles.techStatLabel}>Tamamlanan</Text>
                </View>
                <View style={styles.techStat}>
                  <Text style={styles.techStatNumber}>{tech.avgTime}</Text>
                  <Text style={styles.techStatLabel}>Ort. Süre</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const EquipmentHealth = () => (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Ekipman Sağlık Durumu</Text>
        <Ionicons name="heart" size={20} color="#667eea" />
      </View>
      <View style={styles.healthList}>
        {ANALYTICS_DATA.equipmentHealth.map((equipment, index) => (
          <View key={index} style={styles.healthItem}>
            <View style={styles.healthInfo}>
              <Text style={styles.equipmentName}>{equipment.name}</Text>
              <Text style={styles.maintenanceDate}>
                Son bakım: {new Date(equipment.lastMaintenance).toLocaleDateString('tr-TR')}
              </Text>
            </View>
            <View style={styles.healthBarContainer}>
              <View style={styles.healthBar}>
                <View 
                  style={[
                    styles.healthBarFill,
                    { 
                      width: `${equipment.health}%`,
                      backgroundColor: equipment.health >= 80 ? '#27AE60' : 
                                     equipment.health >= 60 ? '#F39C12' : '#E74C3C'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.healthPercent}>%{equipment.health}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const PredictiveInsights = () => (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Tahmini Bakım Önerileri</Text>
        <Ionicons name="bulb" size={20} color="#667eea" />
      </View>
      <View style={styles.insightsList}>
        <View style={styles.insightItem}>
          <Ionicons name="warning" size={20} color="#F39C12" />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>PMP-001 Pompası</Text>
            <Text style={styles.insightText}>Önümüzdeki 7 gün içinde bakım gerektirebilir</Text>
          </View>
        </View>
        <View style={styles.insightItem}>
          <Ionicons name="trending-up" size={20} color="#E74C3C" />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>VLV-045 Vana Sistemi</Text>
            <Text style={styles.insightText}>Arıza sıklığı son 30 günde %25 arttı</Text>
          </View>
        </View>
        <View style={styles.insightItem}>
          <Ionicons name="calendar" size={20} color="#3498DB" />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>ELC-112 Panosu</Text>
            <Text style={styles.insightText}>Planlı bakım süresi yaklaşıyor (15 gün)</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Analiz & Raporlar</Text>
            <Text style={styles.headerSubtitle}>Gerçek zamanlı bakım istatistikleri</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={handleShareReport}>
              <Ionicons name="share-social" size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleExport}>
              <Ionicons name="download" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeSelector}>
          {['week', 'month', 'quarter', 'year'].map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === range && styles.timeRangeTextActive
              ]}>
                {range === 'week' ? 'Haftalık' :
                 range === 'month' ? 'Aylık' :
                 range === 'quarter' ? '3 Aylık' : 'Yıllık'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <SummaryCards />

        {/* Charts Grid */}
        <View style={styles.chartsGrid}>
          <PriorityChart />
          <TrendChart />
          <FaultTypeChart />
          <TechnicianPerformance />
          <EquipmentHealth />
          <PredictiveInsights />
        </View>

        {/* Bottom Spacer */}
        <View style={styles.spacer} />
      </ScrollView>
    </Animated.View>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  timeRangeButtonActive: {
    backgroundColor: '#FFF',
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  timeRangeTextActive: {
    color: '#667eea',
  },
  content: {
    flex: 1,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    marginHorizontal: -8,
  },
  summaryCard: {
    width: '50%',
    padding: 8,
  },
  summaryGradient: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginVertical: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  chartsGrid: {
    padding: 16,
  },
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  performanceGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  techCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    minWidth: 140,
  },
  techHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  techName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  efficiencyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  efficiencyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  techStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  techStat: {
    alignItems: 'center',
  },
  techStatNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667eea',
    marginBottom: 2,
  },
  techStatLabel: {
    fontSize: 10,
    color: '#666',
  },
  healthList: {
    gap: 12,
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  healthInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  maintenanceDate: {
    fontSize: 11,
    color: '#999',
  },
  healthBarContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  healthBar: {
    width: 60,
    height: 6,
    backgroundColor: '#ECF0F1',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  healthPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  insightText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  spacer: {
    height: 20,
  },
});