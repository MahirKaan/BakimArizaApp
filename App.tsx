// App.tsx - PRODUCTION READY WITH ERROR BOUNDARY
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// YENİ: Error Boundary Import
import ErrorBoundary from './components/ErrorBoundary';
import { CustomErrorFallback } from './components/CustomErrorFallback';

// Sayfa import'ları
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import FaultReportScreen from './screens/FaultReportScreen';
import FaultListScreen from './screens/FaultListScreen';
import FaultDetailScreen from './screens/FaultDetailScreen';
import MapScreen from './screens/MapScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import InventoryScreen from './screens/InventoryScreen';

// Auth Provider
import { AuthProvider, useAuth } from './hooks/useAuth';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FF' }}>
      <ActivityIndicator size="large" color="#667eea" />
      <Text style={{ marginTop: 12, fontSize: 16, color: '#667eea', fontWeight: '500' }}>
        Yükleniyor...
      </Text>
    </View>
  );
}

function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={DefaultTheme}>
      <Stack.Navigator 
        initialRouteName={user ? "Dashboard" : "Login"}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      >
        {!user ? (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ animation: 'fade' }}
          />
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen 
              name="FaultReport" 
              component={FaultReportScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen name="FaultList" component={FaultListScreen} />
            <Stack.Screen name="FaultDetail" component={FaultDetailScreen} />
            <Stack.Screen name="Map" component={MapScreen} />
            <Stack.Screen name="Analytics" component={AnalyticsScreen} />
            <Stack.Screen name="Inventory" component={InventoryScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// YENİ: Error State Management
function AppContent() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = (error: Error) => {
    setError(error);
    console.error('App-level error:', error);
  };

  const resetError = () => {
    setError(null);
  };

  return (
    <ErrorBoundary 
      fallback={
        <CustomErrorFallback 
          error={error!} 
          resetError={resetError} 
        />
      }
      onError={handleError}
    >
      <Navigation />
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}