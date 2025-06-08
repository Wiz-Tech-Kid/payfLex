import { Stack } from 'expo-router';
import * as React from 'react';
import { Platform, StatusBar, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 44,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    zIndex: 10,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  menuIcon: {
    fontSize: 24,
    color: '#0a7ea4',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0a7ea4',
  },
});
