// screens/FaultFormScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../hooks/useSupabase';

export default function FaultFormScreen() {
  const [equipmentId, setEquipmentId] = useState('');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Konum izni ve alınması
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin gerekli', 'Konum izni verilmedi.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    })();
  }, []);

  // Fotoğraf seçme ve Blob’a çevirme
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPhotoPreview(uri); // Önizleme için

      // Expo FileSystem ile Base64 oku ve Blob oluştur
      const fileInfo = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const blob = new Blob([Uint8Array.from(atob(fileInfo), c => c.charCodeAt(0))], {
        type: 'image/jpeg',
      });

      setPhotoBlob(blob);
    }
  };

  // Form submit
  const handleSubmit = async () => {
    let uploadedUrl = null;

    try {
      // Fotoğraf varsa Storage'a yükle
      if (photoBlob) {
        const filename = `${Date.now()}.jpg`;
        const { data, error } = await supabase.storage
          .from('fault-photos')
          .upload(filename, photoBlob);

        if (error) {
          console.log('Fotoğraf yükleme hatası:', error.message);
          Alert.alert('Hata', 'Fotoğraf yüklenemedi.');
          return;
        }

        uploadedUrl = supabase.storage.from('fault-photos').getPublicUrl(data.path).data.publicUrl;
      }

      // Supabase tabloya veri ekle
      const { data, error } = await supabase
        .from('faults')
        .insert([
          {
            equipment_id: equipmentId,
            description,
            photo_url: uploadedUrl,
            location,
          },
        ]);

      if (error) {
        console.log('Kayıt hatası:', error.message);
        Alert.alert('Hata', 'Kayıt eklenemedi.');
      } else {
        console.log('Kayıt eklendi:', data);
        Alert.alert('Başarılı', 'Arıza bildirimi kaydedildi.');
        setEquipmentId('');
        setDescription('');
        setPhotoPreview(null);
        setPhotoBlob(null);
      }
    } catch (err) {
      console.log('Beklenmeyen hata:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Equipment ID</Text>
      <TextInput style={styles.input} value={equipmentId} onChangeText={setEquipmentId} />

      <Text>Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Button title="Pick Photo" onPress={pickImage} />
      {photoPreview && <Image source={{ uri: photoPreview }} style={{ width: 100, height: 100, marginTop: 10 }} />}

      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15 },
});
