import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CompanionChatScreen from './CompanionChatScreen';
import DigitalIDScreen from './DigitalIDScreen';
import FraudAlertScreen from './FraudAlertScreen';
import SendMoneyScreen from './SendMoneyScreen';
import SimulatorScreen from './SimulatorScreen';

const Tab = createBottomTabNavigator();

export default function HomeTabs() {
  return (
    <Tab.Navigator
      initialRouteName="SendMoney"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          switch (route.name) {
            case 'SendMoney':
              iconName = 'send';
              break;
            case 'FraudAlerts':
              iconName = 'warning';
              break;
            case 'DigitalID':
              iconName = 'person-circle';
              break;
            case 'CompanionChat':
              iconName = 'chatbubble-ellipses';
              break;
            case 'Simulator':
              iconName = 'analytics';
              break;
            default:
              iconName = 'ellipse';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="SendMoney" component={SendMoneyScreen} options={{ title: 'Send Money' }} />
      <Tab.Screen name="FraudAlerts" component={FraudAlertScreen} options={{ title: 'Fraud Alerts' }} />
      <Tab.Screen name="DigitalID" component={DigitalIDScreen} options={{ title: 'Digital ID' }} />
      <Tab.Screen name="CompanionChat" component={CompanionChatScreen} options={{ title: 'Companion Chat' }} />
      <Tab.Screen name="Simulator" component={SimulatorScreen} options={{ title: 'Simulator' }} />
    </Tab.Navigator>
  );
}
