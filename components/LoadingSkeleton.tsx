// components/LoadingSkeleton.tsx - Yeni dosya oluştur:
import React from 'react';
import { View, StyleSheet } from 'react-native';

export const LoadingSkeleton = () => (
  <View style={styles.container}>
    {[1, 2, 3, 4, 5].map((item) => (
      <View key={item} style={styles.skeletonItem}>
        <View style={styles.skeletonLine} />
        <View style={styles.skeletonLineShort} />
        <View style={styles.skeletonLineMedium} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 16 },
  skeletonItem: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  skeletonLine: {
    backgroundColor: '#e0e0e0',
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
    width: '80%',
  },
  skeletonLineShort: {
    backgroundColor: '#e0e0e0',
    height: 14,
    borderRadius: 4,
    marginBottom: 6,
    width: '60%',
  },
  skeletonLineMedium: {
    backgroundColor: '#e0e0e0',
    height: 12,
    borderRadius: 4,
    width: '40%',
  },
});
