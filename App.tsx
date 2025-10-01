// App.tsx - TAM HALİ
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Sayfa import'ları - default export kontrolü
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import FaultReportScreen from './screens/FaultReportScreen';
import FaultListScreen from './screens/FaultListScreen';
import FaultDetailScreen from './screens/FaultDetailScreen';
import MapScreen from './screens/MapScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer theme={DefaultTheme}>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ title: 'Dashboard' }}
        />
        <Stack.Screen 
          name="FaultReport" 
          component={FaultReportScreen}
          options={{ title: 'Arıza Bildirimi' }}
        />
        <Stack.Screen 
          name="FaultList" 
          component={FaultListScreen}
          options={{ title: 'Arıza Listesi' }}
        />
        <Stack.Screen 
          name="FaultDetail" 
          component={FaultDetailScreen}
          options={{ title: 'Arıza Detayı' }}
        />
        <Stack.Screen 
          name="Map" 
          component={MapScreen}
          options={{ title: 'Canlı Harita' }}
        />
        <Stack.Screen 
          name="Analytics" 
          component={AnalyticsScreen}
          options={{ title: 'Analizler' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;