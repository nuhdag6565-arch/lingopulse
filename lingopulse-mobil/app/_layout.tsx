import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { WordProvider } from '@/src/context/WordContext';
import { TTSProvider, useTTS } from '@/src/context/TTSContext';
import { ThemeColorsProvider } from '@/src/context/ThemeContext';

// Maps a numeric speed to the exact string used in SPEED_OPTIONS chips
const SPEED_STRS = ['0.25', '0.5', '0.75', '1.0', '1.25', '1.5', '1.75', '2.0'];
function speedToStr(n: number): string {
  return SPEED_STRS.find((s) => Math.abs(parseFloat(s) - n) < 0.001) ?? '1.0';
}

// Rendered inside all providers — can access useAuth() and useTTS()
function AppContent() {
  const systemScheme = useColorScheme();
  const { user } = useAuth();
  const { setTtsSpeed } = useTTS();

  // Sync TTS speed from backend preferences whenever the user changes (login / refresh)
  useEffect(() => {
    if (user?.preferences?.ttsSpeed != null) {
      setTtsSpeed(speedToStr(user.preferences.ttsSpeed));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const isDark = user?.preferences?.darkMode ?? systemScheme === 'dark';

  return (
    <ThemeColorsProvider isDark={isDark}>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="create-list" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="add-word" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="list/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="study/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </ThemeProvider>
    </ThemeColorsProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TTSProvider>
        <AuthProvider>
          <WordProvider>
            <AppContent />
          </WordProvider>
        </AuthProvider>
      </TTSProvider>
    </SafeAreaProvider>
  );
}
