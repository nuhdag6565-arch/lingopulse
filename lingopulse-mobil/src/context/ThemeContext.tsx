import React, { createContext, useContext, useMemo } from 'react';

export const LightColors = {
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primaryLight: '#818CF8',
  secondary: '#10B981',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  cardShadow: 'rgba(0,0,0,0.08)',
};

export const DarkColors = {
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primaryLight: '#818CF8',
  secondary: '#10B981',
  background: '#0F172A',
  surface: '#1E293B',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  cardShadow: 'rgba(0,0,0,0.4)',
};

export type AppColorsType = typeof LightColors;

const ThemeColorsContext = createContext<AppColorsType>(LightColors);

export function ThemeColorsProvider({
  isDark,
  children,
}: {
  isDark: boolean;
  children: React.ReactNode;
}) {
  const colors = useMemo(() => (isDark ? DarkColors : LightColors), [isDark]);
  return (
    <ThemeColorsContext.Provider value={colors}>
      {children}
    </ThemeColorsContext.Provider>
  );
}

export function useAppColors(): AppColorsType {
  return useContext(ThemeColorsContext);
}
