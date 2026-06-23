import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveApiUrl(): string {
  // Explicit override in .env.local wins
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // In Expo Go / dev builds, hostUri is "192.168.x.x:8081" — extract the LAN IP automatically
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:8000/api/v1`;
  }

  // Emulator fallback
  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${host}:8000/api/v1`;
}

export const API_BASE_URL = resolveApiUrl();
