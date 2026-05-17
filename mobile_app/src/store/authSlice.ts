import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../api/auth';
import { tokenStorage } from '../utils/storage';
import type { LoginRequest, RegisterRequest, UserProfile } from '../types/auth';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (data: LoginRequest, { rejectWithValue }) => {
    try {
      const tokens = await authApi.login(data);
      await tokenStorage.saveTokens(tokens.access_token, tokens.refresh_token);
      return await authApi.me();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail ?? 'Giriş başarısız.';
      return rejectWithValue(msg);
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const tokens = await authApi.register(data);
      await tokenStorage.saveTokens(tokens.access_token, tokens.refresh_token);
      return await authApi.me();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail ?? 'Kayıt başarısız.';
      return rejectWithValue(msg);
    }
  },
);

export const loadCurrentUser = createAsyncThunk(
  'auth/loadCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = await tokenStorage.getAccessToken();
      if (!token) return rejectWithValue('no_token');
      return await authApi.me();
    } catch {
      return rejectWithValue('session_expired');
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await tokenStorage.clearTokens();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending = (state: AuthState) => { state.loading = true; state.error = null; };
    const fulfilled = (state: AuthState, action: PayloadAction<UserProfile>) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    };
    const rejected = (state: AuthState, action: ReturnType<typeof login.rejected>) => {
      state.loading = false;
      state.error = action.payload as string;
    };

    builder
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, fulfilled)
      .addCase(login.rejected, rejected)
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, fulfilled)
      .addCase(register.rejected, rejected)
      .addCase(loadCurrentUser.pending, pending)
      .addCase(loadCurrentUser.fulfilled, fulfilled)
      .addCase(loadCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
