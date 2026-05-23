import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/src/context/AuthContext';
import { WordProvider } from '@/src/context/WordContext';
import { TTSProvider } from '@/src/context/TTSContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <TTSProvider>
      <AuthProvider>
        <WordProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="create-list" options={{ presentation: 'modal', headerShown: false }} />
              <Stack.Screen name="add-word" options={{ presentation: 'modal', headerShown: false }} />
              <Stack.Screen name="list/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="study/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </WordProvider>
      </AuthProvider>
      </TTSProvider>
    </SafeAreaProvider>
  );
}
