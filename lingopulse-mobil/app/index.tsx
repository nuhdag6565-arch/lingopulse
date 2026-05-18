import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { AppColors } from '@/src/constants/colors';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  // <Redirect> is render-time — fires after navigator is mounted (safe)
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)/onboarding'} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
});
