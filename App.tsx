import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import HomeTabs from './app/screens/HomeTabs';
import Landing from './app/screens/Landing';
import LoanApplication from './app/screens/LoanApplication';
import LoginScreen from './app/screens/LoginScreen';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={Landing} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="HomeTabs" component={HomeTabs} />
        <Stack.Screen name="LoanApplication" component={LoanApplication} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
