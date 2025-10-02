// screens/InventoryScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function InventoryScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Stok Sorgulama</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Text style={styles.comingSoon}>Stok Sorgulama Ekranı</Text>
        
        {/* Örnek stok item'ları */}
        <View style={styles.stockItem}>
          <Ionicons name="cube-outline" size={24} color="#667eea" />
          <View style={styles.stockInfo}>
            <Text style={styles.stockName}>Yedek Pompa</Text>
            <Text style={styles.stockDetails}>Stok: 15 adet • Kritik: 5 adet</Text>
          </View>
          <Text style={styles.stockStatus}>Yeterli</Text>
        </View>

        <View style={styles.stockItem}>
          <Ionicons name="construct-outline" size={24} color="#FFA726" />
          <View style={styles.stockInfo}>
            <Text style={styles.stockName}>Vana Seti</Text>
            <Text style={styles.stockDetails}>Stok: 3 adet • Kritik: 10 adet</Text>
          </View>
          <Text style={[styles.stockStatus, styles.lowStock]}>Az</Text>
        </View>

        <View style={styles.stockItem}>
          <Ionicons name="water-outline" size={24} color="#4ECDC4" />
          <View style={styles.stockInfo}>
            <Text style={styles.stockName}>Filtre</Text>
            <Text style={styles.stockDetails}>Stok: 8 adet • Kritik: 4 adet</Text>
          </View>
          <Text style={styles.stockStatus}>Yeterli</Text>
        </View>

        <View style={styles.stockItem}>
          <Ionicons name="hardware-chip-outline" size={24} color="#AB47BC" />
          <View style={styles.stockInfo}>
            <Text style={styles.stockName}>Sensör</Text>
            <Text style={styles.stockDetails}>Stok: 12 adet • Kritik: 6 adet</Text>
          </View>
          <Text style={styles.stockStatus}>Yeterli</Text>
        </View>

        <View style={styles.stockItem}>
          <Ionicons name="flash-outline" size={24} color="#F39C12" />
          <View style={styles.stockInfo}>
            <Text style={styles.stockName}>Elektrik Panosu</Text>
            <Text style={styles.stockDetails}>Stok: 2 adet • Kritik: 3 adet</Text>
          </View>
          <Text style={[styles.stockStatus, styles.lowStock]}>Az</Text>
        </View>
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
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  comingSoon: {
    textAlign: 'center',
    fontSize: 18,
    color: '#667eea',
    fontWeight: '600',
    marginBottom: 20,
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stockInfo: {
    flex: 1,
    marginLeft: 12,
  },
  stockName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  stockDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#27AE60',
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lowStock: {
    color: '#E74C3C',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
});