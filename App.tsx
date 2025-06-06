import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import AccountCreationScreen from './app/screens/AccountCreationScreen';
import HomeTabs from './app/screens/HomeTabs';
import Landing from './app/screens/Landing';
import LoanApplication from './app/screens/LoanApplication';
import Login from './app/screens/Login';

import ChatbotFloatingButton from './components/ui/ChatbotFloatingButton';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={Landing} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="HomeTabs" component={HomeTabs} />
        <Stack.Screen name="LoanApplication" component={LoanApplication} />
        <Stack.Screen name="AccountCreationScreen" component={AccountCreationScreen} />
      </Stack.Navigator>
      <ChatbotFloatingButton />
    </NavigationContainer>
  );
}
