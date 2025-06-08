import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import AccountCreationScreen from './app/(tabs)/screens/AccountCreationScreen';
import HomeTabs from './app/(tabs)/screens/HomeTabs';
import LoanApplication from './app/(tabs)/screens/LoanApplication';
import Login from './app/(tabs)/screens/Login';

import ChatbotFloatingButton from './components/ui/ChatbotFloatingButton';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false, headerTitle: '' }} // Hide all headers and clear titles
      >
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false, headerTitle: '' }} />
        <Stack.Screen name="HomeTabs" component={HomeTabs} options={{ headerShown: false, headerTitle: '' }} />
        <Stack.Screen name="LoanApplication" component={LoanApplication} options={{ headerShown: false, headerTitle: '' }} />
        <Stack.Screen name="AccountCreationScreen" component={AccountCreationScreen} options={{ headerShown: false, headerTitle: '' }} />
      </Stack.Navigator>
      <ChatbotFloatingButton />
    </NavigationContainer>
  );
}
