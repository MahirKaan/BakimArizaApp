import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FaultFormScreen from './screens/FaultFormScreen';
import FaultListScreen from './screens/FaultListScreen';
import { Button } from 'react-native';

export type RootStackParamList = {
  Form: undefined;
  List: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Form">
        <Stack.Screen
          name="Form"
          component={FaultFormScreen}
          options={({ navigation }) => ({
            title: 'Arıza Bildirimi',
            headerRight: () => (
              <Button title="List" onPress={() => navigation.navigate('List')} />
            ),
          })}
        />
        <Stack.Screen
          name="List"
          component={FaultListScreen}
          options={{ title: 'Arıza Listesi' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
