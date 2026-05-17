import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { AuthStackParamList, AppStackParamList } from './types';

import { OnboardingScreen } from '../screens/OnboardingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { WordListScreen } from '../screens/WordListScreen';
import { AddWordScreen } from '../screens/AddWordScreen';
import { FlashCardScreen } from '../screens/FlashCardScreen';
import { StatsScreen } from '../screens/StatsScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const AUTH_HEADER = {
  headerStyle: { backgroundColor: '#F5F3FF' },
  headerTintColor: '#4F46E5',
  headerTitleStyle: { fontWeight: '700' as const },
  headerShadowVisible: false,
};

const APP_HEADER = {
  headerStyle: { backgroundColor: '#4F46E5' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '700' as const },
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={AUTH_HEADER}>
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Giriş Yap' }} />
      <AuthStack.Screen name="Register" component={RegisterScreen} options={{ title: 'Hesap Oluştur' }} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <AppStack.Navigator screenOptions={APP_HEADER}>
      <AppStack.Screen name="Home" component={HomeScreen} options={{ title: 'LingoPulse' }} />
      <AppStack.Screen name="WordList" component={WordListScreen} options={{ title: 'Kelimelerim' }} />
      <AppStack.Screen name="AddWord" component={AddWordScreen} options={{ title: 'Kelime Ekle' }} />
      <AppStack.Screen name="FlashCard" component={FlashCardScreen} options={{ title: 'Tekrar' }} />
      <AppStack.Screen name="Stats" component={StatsScreen} options={{ title: 'İstatistikler' }} />
    </AppStack.Navigator>
  );
}

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, loading } = useSelector((s: RootState) => s.auth);

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splash: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F3FF' },
});
