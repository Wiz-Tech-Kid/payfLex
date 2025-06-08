import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

// 1. Import QueryClient and QueryClientProvider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import ChatbotFloatingButton from '../components/ui/ChatbotFloatingButton';

// 2. Create a QueryClient instance (outside the component)
const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const segments = useSegments();
  const pathname = usePathname();

  // Determine if chatbot should be shown
  const hideChatbot =
    pathname === '/' ||
    pathname === '/screens/Login' ||
    pathname === '/screens/AccountCreationScreen';

  if (!loaded) {
    return null;
  }

  return (
    // 3. Wrap everything in QueryClientProvider
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* Children of ThemeProvider start here */}
        <>
          <Stack
            screenOptions={{
              headerShown: false, // Hide headers
              gestureEnabled: true, // Enable gestures for navigation
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false, headerTitle: '' }} />
            <Stack.Screen name="+not-found" options={{ headerShown: false, headerTitle: '' }} />
          </Stack>
          <StatusBar style="auto" />
          {/* Only show chatbot if NOT on login, or account creation */}
          {!hideChatbot && <ChatbotFloatingButton />}
        </>
      </ThemeProvider>
    </QueryClientProvider>
  );
}