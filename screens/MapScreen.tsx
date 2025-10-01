// screens/MapScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline, Circle, Region } from 'react-native-maps';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Types tanımlamaları
interface MapScreenProps {
  navigation: any;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface FaultLocation {
  id: string;
  equipmentId: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low' | 'completed';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  coordinate: Coordinate;
  assignedTo: string | null;
  timestamp: string;
}

interface Technician {
  id: string;
  name: string;
  coordinate: Coordinate;
  status: 'active' | 'available' | 'busy' | 'offline';
  currentTask: string | null;
}

const FAULT_LOCATIONS: FaultLocation[] = [
  {
    id: '1',
    equipmentId: 'PMP-001',
    title: 'Pompa Aşırı Isınma',
    priority: 'high',
    status: 'in_progress',
    coordinate: {
      latitude: 41.0082,
      longitude: 28.9784
    },
    assignedTo: 'Ahmet Y.',
    timestamp: '2024-02-15T10:30:00Z'
  },
  {
    id: '2',
    equipmentId: 'VLV-045',
    title: 'Vana Sızıntısı',
    priority: 'medium',
    status: 'pending',
    coordinate: {
      latitude: 41.0150,
      longitude: 28.9850
    },
    assignedTo: null,
    timestamp: '2024-02-15T09:15:00Z'
  },
  {
    id: '3',
    equipmentId: 'ELC-112',
    title: 'Elektrik Panosu Arızası',
    priority: 'critical',
    status: 'pending',
    coordinate: {
      latitude: 41.0050,
      longitude: 28.9700
    },
    assignedTo: null,
    timestamp: '2024-02-15T08:45:00Z'
  },
  {
    id: '4',
    equipmentId: 'MTR-023',
    title: 'Motor Titreşim Sorunu',
    priority: 'low',
    status: 'completed',
    coordinate: {
      latitude: 41.0120,
      longitude: 28.9750
    },
    assignedTo: 'Mehmet K.',
    timestamp: '2024-02-14T16:20:00Z'
  }
];

const TECHNICIANS: Technician[] = [
  {
    id: 't1',
    name: 'Ahmet Yılmaz',
    coordinate: {
      latitude: 41.0090,
      longitude: 28.9790
    },
    status: 'active',
    currentTask: 'PMP-001'
  },
  {
    id: 't2',
    name: 'Mehmet Kaya',
    coordinate: {
      latitude: 41.0130,
      longitude: 28.9760
    },
    status: 'available',
    currentTask: null
  },
  {
    id: 't3', 
    name: 'Ayşe Demir',
    coordinate: {
      latitude: 41.0060,
      longitude: 28.9710
    },
    status: 'busy',
    currentTask: 'ELC-112'
  }
];

export default function MapScreen({ navigation }: MapScreenProps) {
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [selectedFault, setSelectedFault] = useState<FaultLocation | null>(null);
  const [showTechnicians, setShowTechnicians] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  const priorityColors: Record<string, string> = {
    critical: '#E74C3C',
    high: '#FF6B6B', 
    medium: '#F39C12',
    low: '#27AE60',
    completed: '#95A5A6'
  };

  const statusColors: Record<string, string> = {
    active: '#27AE60',
    available: '#3498DB',
    busy: '#E74C3C',
    offline: '#95A5A6'
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Konum izni verilmedi');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const coords: Coordinate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
      setLocation(coords);
      setLoading(false);

      // Haritayı kullanıcı konumuna ve arızalara zoom yap
      setTimeout(() => {
        if (mapRef.current) {
          const coordinates = [
            ...FAULT_LOCATIONS.map(f => f.coordinate),
            ...TECHNICIANS.map(t => t.coordinate)
          ];
          mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      }, 1000);
    })();
  }, []);

  const getPriorityIcon = (priority: string): string => {
    const icons: Record<string, string> = {
      critical: 'flash',
      high: 'warning',
      medium: 'alert-circle', 
      low: 'information',
      completed: 'checkmark'
    };
    return icons[priority] || 'warning';
  };

  const getTechnicianIcon = (status: string): string => {
    const icons: Record<string, string> = {
      active: 'person',
      available: 'person-outline',
      busy: 'person-remove',
      offline: 'person-off'
    };
    return icons[status] || 'person-outline';
  };

  const handleFaultPress = (fault: FaultLocation) => {
    setSelectedFault(fault);
    // Marker'a zoom yap
    if (mapRef.current) {
      const region: Region = {
        ...fault.coordinate,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  const handleTechnicianPress = (tech: Technician) => {
    Alert.alert(
      tech.name,
      `Durum: ${tech.status}\n${tech.currentTask ? `Mevcut Görev: ${tech.currentTask}` : 'Müsait'}`,
      [
        { text: 'Mesaj Gönder', onPress: () => sendMessage(tech) },
        { text: 'Ara', onPress: () => callTechnician(tech) },
        { text: 'Kapat', style: 'cancel' }
      ]
    );
  };

  const sendMessage = (tech: Technician) => {
    Alert.alert('Mesaj Gönder', `${tech.name} adlı teknisyene mesaj gönderilecek`);
  };

  const callTechnician = (tech: Technician) => {
    Alert.alert('Ara', `${tech.name} adlı teknisyen aranacak`);
  };

  const navigateToFault = (fault: FaultLocation) => {
    navigation.navigate('FaultDetail', { faultId: fault.id });
    setSelectedFault(null);
  };

  const focusOnUserLocation = () => {
    if (location && mapRef.current) {
      const region: Region = {
        ...location,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  const showAllFaults = () => {
    if (mapRef.current) {
      mapRef.current.fitToCoordinates(
        FAULT_LOCATIONS.map(f => f.coordinate),
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
    }
  };

  const FaultMarker = ({ fault }: { fault: FaultLocation }) => (
    <Marker
      coordinate={fault.coordinate}
      onPress={() => handleFaultPress(fault)}
    >
      <View style={[styles.markerContainer, { backgroundColor: priorityColors[fault.priority] }]}>
        <Ionicons 
          name={getPriorityIcon(fault.priority) as any} 
          size={16} 
          color="#FFF" 
        />
      </View>
    </Marker>
  );

  const TechnicianMarker = ({ technician }: { technician: Technician }) => (
    <Marker
      coordinate={technician.coordinate}
      onPress={() => handleTechnicianPress(technician)}
    >
      <View style={[styles.techMarker, { backgroundColor: statusColors[technician.status] }]}>
        <Ionicons 
          name={getTechnicianIcon(technician.status) as any} 
          size={14} 
          color="#FFF" 
        />
      </View>
    </Marker>
  );

  const SelectedFaultCard = () => {
    if (!selectedFault) return null;

    return (
      <View style={styles.selectedFaultCard}>
        <LinearGradient
          colors={['#667eea', '#764ba2'] as const}
          style={styles.selectedFaultHeader}
        >
          <View style={styles.faultHeaderInfo}>
            <Text style={styles.selectedEquipmentId}>{selectedFault.equipmentId}</Text>
            <Text style={styles.selectedFaultTitle}>{selectedFault.title}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColors[selectedFault.priority] }]}>
            <Text style={styles.priorityBadgeText}>
              {selectedFault.priority === 'critical' ? 'KRİTİK' : 
               selectedFault.priority === 'high' ? 'YÜKSEK' :
               selectedFault.priority === 'medium' ? 'ORTA' : 'DÜŞÜK'}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.selectedFaultContent}>
          <View style={styles.faultDetailRow}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.faultDetailText}>
              {new Date(selectedFault.timestamp).toLocaleString('tr-TR')}
            </Text>
          </View>
          
          <View style={styles.faultDetailRow}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.faultDetailText}>
              {selectedFault.assignedTo || 'Atanmamış'}
            </Text>
          </View>

          <View style={styles.faultActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigateToFault(selectedFault)}
            >
              <Ionicons name="open" size={16} color="#667eea" />
              <Text style={styles.actionButtonText}>Detayları Gör</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setSelectedFault(null)}
            >
              <Ionicons name="close" size={16} color="#666" />
              <Text style={styles.actionButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const MapControls = () => (
    <View style={styles.controlsContainer}>
      <TouchableOpacity 
        style={styles.controlButton}
        onPress={focusOnUserLocation}
      >
        <Ionicons name="locate" size={20} color="#667eea" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.controlButton}
        onPress={showAllFaults}
      >
        <Ionicons name="expand" size={20} color="#667eea" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.controlButton, showTechnicians && styles.controlButtonActive]}
        onPress={() => setShowTechnicians(!showTechnicians)}
      >
        <Ionicons name="people" size={20} color={showTechnicians ? "#FFF" : "#667eea"} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.controlButton, showHeatmap && styles.controlButtonActive]}
        onPress={() => setShowHeatmap(!showHeatmap)}
      >
        <Ionicons name="layers" size={20} color={showHeatmap ? "#FFF" : "#667eea"} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.controlButton}
        onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
      >
        <Ionicons name="map" size={20} color="#667eea" />
      </TouchableOpacity>
    </View>
  );

  const Legend = () => (
    <View style={styles.legend}>
      <Text style={styles.legendTitle}>Gösterge</Text>
      
      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: '#E74C3C' }]} />
        <Text style={styles.legendText}>Kritik Arıza</Text>
      </View>
      
      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
        <Text style={styles.legendText}>Yüksek Öncelik</Text>
      </View>
      
      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: '#F39C12' }]} />
        <Text style={styles.legendText}>Orta Öncelik</Text>
      </View>

      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: '#27AE60' }]} />
        <Text style={styles.legendText}>Düşük Öncelik</Text>
      </View>

      {showTechnicians && (
        <>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#27AE60' }]} />
            <Text style={styles.legendText}>Aktif Teknisyen</Text>
          </View>
          
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#3498DB' }]} />
            <Text style={styles.legendText}>Müsait Teknisyen</Text>
          </View>
        </>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Harita Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        mapType={mapType}
        initialRegion={{
          latitude: 41.0082,
          longitude: 28.9784,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {/* Arıza Marker'ları */}
        {FAULT_LOCATIONS.map(fault => (
          <FaultMarker key={fault.id} fault={fault} />
        ))}

        {/* Teknisyen Marker'ları */}
        {showTechnicians && TECHNICIANS.map(tech => (
          <TechnicianMarker key={tech.id} technician={tech} />
        ))}

        {/* Heatmap için daireler */}
        {showHeatmap && FAULT_LOCATIONS.map(fault => (
          <Circle
            key={`heat-${fault.id}`}
            center={fault.coordinate}
            radius={500}
            strokeWidth={1}
            strokeColor={priorityColors[fault.priority]}
            fillColor={`${priorityColors[fault.priority]}20`}
          />
        ))}

        {/* Kullanıcı konumundan en yakın kritik arızaya çizgi */}
        {location && selectedFault && selectedFault.priority === 'critical' && (
          <Polyline
            coordinates={[location, selectedFault.coordinate]}
            strokeColor="#E74C3C"
            strokeWidth={3}
            lineDashPattern={[10, 5]}
          />
        )}
      </MapView>

      {/* Seçili Arıza Kartı */}
      <SelectedFaultCard />

      {/* Harita Kontrolleri */}
      <MapControls />

      {/* Gösterge */}
      <Legend />

      {/* Hızlı İstatistikler */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{FAULT_LOCATIONS.length}</Text>
          <Text style={styles.statLabel}>Toplam Arıza</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {FAULT_LOCATIONS.filter(f => f.priority === 'critical').length}
          </Text>
          <Text style={styles.statLabel}>Kritik</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {TECHNICIANS.filter(t => t.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Aktif Teknisyen</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height,
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
    color: '#666',
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  techMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedFaultCard: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  selectedFaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  faultHeaderInfo: {
    flex: 1,
  },
  selectedEquipmentId: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  selectedFaultTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  selectedFaultContent: {
    padding: 16,
  },
  faultDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  faultDetailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  faultActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  controlsContainer: {
    position: 'absolute',
    right: 20,
    top: '30%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  controlButtonActive: {
    backgroundColor: '#667eea',
  },
  legend: {
    position: 'absolute',
    left: 20,
    bottom: 100,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    maxWidth: 150,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 10,
    color: '#666',
  },
  statsBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
});