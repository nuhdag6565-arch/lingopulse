import axios from 'axios';
import { API_BASE_URL } from './config';

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
