import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { supabase } from '../hooks/useSupabase';

type Fault = {
  id: string;
  equipment_id: string;
  description: string;
  photo_url: string | null;
  location: { lat: number; lng: number } | null;
  created_at: string;
};

export default function FaultListScreen() {
  const [faults, setFaults] = useState<Fault[]>([]);

  const fetchFaults = async () => {
    const { data, error } = await supabase
      .from('faults')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Hata:', error.message);
    } else {
      setFaults(data as Fault[]);
    }
  };

  useEffect(() => {
    fetchFaults();
    // Opsiyonel: Her 10 saniyede güncelle
    const interval = setInterval(fetchFaults, 10000);
    return () => clearInterval(interval);
  }, []);

  const renderItem = ({ item }: { item: Fault }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Equipment: {item.equipment_id}</Text>
      <Text>Description: {item.description}</Text>
      <Text>Date: {new Date(item.created_at).toLocaleString()}</Text>
      {item.photo_url && <Image source={{ uri: item.photo_url }} style={styles.image} />}
      {item.location && (
        <Text>
          Location: {item.location.lat.toFixed(4)}, {item.location.lng.toFixed(4)}
        </Text>
      )}
    </View>
  );

  return (
    <FlatList
      data={faults}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 20 }}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  title: { fontWeight: 'bold', marginBottom: 5 },
  image: { width: 150, height: 150, marginTop: 10 },
});
