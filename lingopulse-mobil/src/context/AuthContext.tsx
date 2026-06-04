import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import { firebaseAuth, isFirebaseConfigured } from '@/src/config/firebase';
import {
  apiLogin,
  apiRegister,
  apiVerifyFirebaseToken,
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
  loginWithGoogle: (googleIdToken: string) => Promise<void>;
  loginWithApple: (identityToken: string, fullName?: string) => Promise<void>;
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

async function exchangeFirebaseToken(idToken: string, fullName?: string): Promise<User> {
  const tokens = await apiVerifyFirebaseToken(idToken, fullName);
  await SecureStore.setItemAsync('access_token', tokens.access_token);
  await SecureStore.setItemAsync('refresh_token', tokens.refresh_token);
  const me = await apiGetMe(tokens.access_token);
  return mapUser(me);
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
    if (isFirebaseConfigured && firebaseAuth) {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await credential.user.getIdToken();
      const me = await exchangeFirebaseToken(idToken);
      setUser(me);
    } else {
      const tokens = await apiLogin(email, password);
      await SecureStore.setItemAsync('access_token', tokens.access_token);
      await SecureStore.setItemAsync('refresh_token', tokens.refresh_token);
      const me = await apiGetMe(tokens.access_token);
      setUser(mapUser(me));
    }
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    if (isFirebaseConfigured && firebaseAuth) {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await credential.user.getIdToken();
      const me = await exchangeFirebaseToken(idToken, fullName);
      setUser(me);
    } else {
      const tokens = await apiRegister(fullName, email, password);
      await SecureStore.setItemAsync('access_token', tokens.access_token);
      await SecureStore.setItemAsync('refresh_token', tokens.refresh_token);
      const me = await apiGetMe(tokens.access_token);
      setUser(mapUser(me));
    }
  }, []);

  const loginWithGoogle = useCallback(async (googleIdToken: string) => {
    if (!isFirebaseConfigured || !firebaseAuth) {
      throw new Error('Firebase yapılandırılmamış. Lütfen .env.local dosyasını doldurun.');
    }
    const credential = GoogleAuthProvider.credential(googleIdToken);
    const userCredential = await signInWithCredential(firebaseAuth, credential);
    const firebaseIdToken = await userCredential.user.getIdToken();
    const me = await exchangeFirebaseToken(firebaseIdToken);
    setUser(me);
  }, []);

  const loginWithApple = useCallback(async (identityToken: string, fullName?: string) => {
    if (!isFirebaseConfigured || !firebaseAuth) {
      throw new Error('Firebase yapılandırılmamış. Lütfen .env.local dosyasını doldurun.');
    }
    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({ idToken: identityToken });
    const userCredential = await signInWithCredential(firebaseAuth, credential);
    const firebaseIdToken = await userCredential.user.getIdToken();
    const me = await exchangeFirebaseToken(firebaseIdToken, fullName);
    setUser(me);
  }, []);

  const logout = useCallback(async () => {
    if (isFirebaseConfigured && firebaseAuth) {
      await firebaseSignOut(firebaseAuth);
    }
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (fullName: string) => {
    const updated = await apiUpdateProfile(fullName);
    setUser(mapUser(updated));
  }, []);

  const updatePreferences = useCallback(async (prefs: Partial<UserPreferences>) => {
    const payload: { tts_speed?: number; tts_accent?: string; dark_mode?: boolean } = {};
    if (prefs.ttsSpeed !== undefined) payload.tts_speed = prefs.ttsSpeed;
    if (prefs.ttsAccent !== undefined) payload.tts_accent = prefs.ttsAccent;
    if (prefs.darkMode !== undefined) payload.dark_mode = prefs.darkMode;
    const updated = await apiUpdatePreferences(payload);
    setUser(mapUser(updated));
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, isLoading,
      login, register, loginWithGoogle, loginWithApple,
      logout, updateProfile, updatePreferences,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
