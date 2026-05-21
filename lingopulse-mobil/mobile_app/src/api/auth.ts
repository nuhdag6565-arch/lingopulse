import { apiClient } from './client';
import type { AuthTokens, LoginRequest, RegisterRequest, UserProfile } from '../types/auth';

export const authApi = {
  register: (data: RegisterRequest): Promise<AuthTokens> =>
    apiClient.post('/auth/register', data),

  login: (data: LoginRequest): Promise<AuthTokens> =>
    apiClient.post('/auth/login', data),

  refresh: (refresh_token: string): Promise<AuthTokens> =>
    apiClient.post('/auth/refresh', { refresh_token }),

  me: (): Promise<UserProfile> =>
    apiClient.get('/auth/me'),
};
