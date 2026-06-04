import axios from 'axios';
import { API_BASE_URL } from './config';
import api from './client';

export interface PreferencesResponse {
  tts_speed: number;
  tts_accent: string;
  dark_mode: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  preferences: PreferencesResponse;
}

const plain = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

export async function apiLogin(email: string, password: string): Promise<TokenResponse> {
  const { data } = await plain.post('/auth/login', { email, password });
  return data;
}

export async function apiRegister(
  fullName: string,
  email: string,
  password: string,
): Promise<TokenResponse> {
  const { data } = await plain.post('/auth/register', {
    email,
    password,
    full_name: fullName,
  });
  return data;
}

export async function apiGetMe(accessToken: string): Promise<UserResponse> {
  const { data } = await plain.get('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}

export async function apiForgotPassword(email: string): Promise<void> {
  await plain.post('/auth/forgot-password', { email });
}

export async function apiResetPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  await plain.post('/auth/reset-password', { email, code, new_password: newPassword });
}

export async function apiVerifyFirebaseToken(
  idToken: string,
  fullName?: string,
): Promise<TokenResponse> {
  const { data } = await plain.post('/auth/verify-token', {
    id_token: idToken,
    full_name: fullName ?? '',
  });
  return data;
}

export async function apiChangePassword(
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  await api.put('/users/me/password', { old_password: oldPassword, new_password: newPassword });
}

export async function apiUpdateProfile(fullName: string): Promise<UserResponse> {
  const { data } = await api.put<UserResponse>('/users/me', { full_name: fullName });
  return data;
}

export async function apiUpdatePreferences(prefs: {
  tts_speed?: number;
  tts_accent?: string;
  dark_mode?: boolean;
}): Promise<UserResponse> {
  const { data } = await api.put<UserResponse>('/users/me/preferences', prefs);
  return data;
}
