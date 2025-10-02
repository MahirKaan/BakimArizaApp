// hooks/useLocalStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useLocalStorage = () => {
  const storeData = async (key: string, value: any) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (e) {
      console.log('Storage error:', e);
      return false;
    }
  };

  const getData = async (key: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.log('Storage error:', e);
      return null;
    }
  };

  const removeData = async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (e) {
      console.log('Storage error:', e);
      return false;
    }
  };

  const clearAll = async () => {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (e) {
      console.log('Clear storage error:', e);
      return false;
    }
  };

  return { storeData, getData, removeData, clearAll };
};

export default useLocalStorage;