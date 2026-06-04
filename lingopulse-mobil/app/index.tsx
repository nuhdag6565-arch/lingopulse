import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useAppColors } from '@/src/context/ThemeContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const c = useAppColors();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.background }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)/onboarding'} />;
}
