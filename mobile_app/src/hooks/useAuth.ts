import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { login, register, logout, clearError } from '../store/authSlice';
import type { LoginRequest, RegisterRequest } from '../types/auth';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, loading, error } = useSelector(
    (s: RootState) => s.auth,
  );

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login: (data: LoginRequest) => dispatch(login(data)),
    register: (data: RegisterRequest) => dispatch(register(data)),
    logout: () => dispatch(logout()),
    clearError: () => dispatch(clearError()),
  };
}
