import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  apiLogin,
  apiRegister,
  apiGetMe,
  apiUpdateProfile,
  apiUpdatePreferences,
  type UserResponse,
} from '../api/auth';

export interface UserPreferences {
  ttsSpeed: number;
  ttsAccent: string;
  darkMode: boolean;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  preferences: UserPreferences;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (fullName: string) => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapUser(u: UserResponse): User {
  return {
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    preferences: {
      ttsSpeed: u.preferences?.tts_speed ?? 1.0,
      ttsAccent: u.preferences?.tts_accent ?? 'us',
      darkMode: u.preferences?.dark_mode ?? false,
    },
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const token = await SecureStore.getItemAsync('access_token');
        if (token) {
          const me = await apiGetMe(token);
          setUser(mapUser(me));
        }
      } catch {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await apiLogin(email, password);
    await SecureStore.setItemAsync('access_token', tokens.access_token);
    await SecureStore.setItemAsync('refresh_token', tokens.refresh_token);
    const me = await apiGetMe(tokens.access_token);
    setUser(mapUser(me));
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    const tokens = await apiRegister(fullName, email, password);
    await SecureStore.setItemAsync('access_token', tokens.access_token);
    await SecureStore.setItemAsync('refresh_token', tokens.refresh_token);
    const me = await apiGetMe(tokens.access_token);
    setUser(mapUser(me));
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (fullName: string) => {
    const updated = await apiUpdateProfile(fullName);
    setUser(mapUser(updated));
  }, []);

  const updatePreferences = useCallback(async (prefs: Partial<UserPreferences>) => {
    const apiPayload: { tts_speed?: number; tts_accent?: string; dark_mode?: boolean } = {};
    if (prefs.ttsSpeed !== undefined) apiPayload.tts_speed = prefs.ttsSpeed;
    if (prefs.ttsAccent !== undefined) apiPayload.tts_accent = prefs.ttsAccent;
    if (prefs.darkMode !== undefined) apiPayload.dark_mode = prefs.darkMode;
    const updated = await apiUpdatePreferences(apiPayload);
    setUser(mapUser(updated));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
