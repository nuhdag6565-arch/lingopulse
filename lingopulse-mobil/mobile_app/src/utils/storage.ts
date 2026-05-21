/**
 * expo-secure-store wrapper — tokenları iOS Keychain / Android Keystore'da saklar.
 * Düz AsyncStorage kullanmak güvensizdir, bu yüzden SecureStore zorunlu.
 */
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const tokenStorage = {
  async saveTokens(access: string, refresh: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, access),
      SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refresh),
    ]);
  },

  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
    ]);
  },
};
