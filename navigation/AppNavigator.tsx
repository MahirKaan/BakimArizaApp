// navigation/AppNavigator.tsx - ANA NAVIGATOR
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';

// Geçici placeholder componentler - sonra gerçeklerini yazacağız
const TemporaryScreen = ({ name }: { name: string }) => (
  <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FF' }}>
    <h1>{name} Screen</h1>
    <p>Bu ekran yakında eklenecek!</p>
  </div>
);

// Geçici componentler
const FaultReportScreen = () => <TemporaryScreen name="Fault Report" />;
const FaultListScreen = () => <TemporaryScreen name="Fault List" />;
const InventoryScreen = () => <TemporaryScreen name="Inventory" />;
const ProfileScreen = () => <TemporaryScreen name="Profile" />;
const SettingsScreen = () => <TemporaryScreen name="Settings" />;
const TeamManagementScreen = () => <TemporaryScreen name="Team Management" />;
const UserManagementScreen = () => <TemporaryScreen name="User Management" />;
const AnalyticsScreen = () => <TemporaryScreen name="Analytics" />;
const MapScreen = () => <TemporaryScreen name="Map" />;
const TimeTrackingScreen = () => <TemporaryScreen name="Time Tracking" />;
const ReportsScreen = () => <TemporaryScreen name="Reports" />;
const CostAnalysisScreen = () => <TemporaryScreen name="Cost Analysis" />;
const SystemSettingsScreen = () => <TemporaryScreen name="System Settings" />;
const BackupScreen = () => <TemporaryScreen name="Backup" />;

import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FF' }}>
        <h2>Yükleniyor...</h2>
      </div>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          cardStyle: { backgroundColor: '#F8F9FF' }
        }}
      >
        {!user ? (
          // Kullanıcı giriş yapmamışsa Login ekranı
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          // Kullanıcı giriş yapmışsa Dashboard ve diğer ekranlar
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="FaultReport" component={FaultReportScreen} />
            <Stack.Screen name="FaultList" component={FaultListScreen} />
            <Stack.Screen name="Inventory" component={InventoryScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="TeamManagement" component={TeamManagementScreen} />
            <Stack.Screen name="UserManagement" component={UserManagementScreen} />
            <Stack.Screen name="Analytics" component={AnalyticsScreen} />
            <Stack.Screen name="Map" component={MapScreen} />
            <Stack.Screen name="TimeTracking" component={TimeTrackingScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
            <Stack.Screen name="CostAnalysis" component={CostAnalysisScreen} />
            <Stack.Screen name="SystemSettings" component={SystemSettingsScreen} />
            <Stack.Screen name="Backup" component={BackupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}