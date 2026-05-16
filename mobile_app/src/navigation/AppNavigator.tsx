import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

import { HomeScreen } from '../screens/HomeScreen';
import { WordListScreen } from '../screens/WordListScreen';
import { AddWordScreen } from '../screens/AddWordScreen';
import { FlashCardScreen } from '../screens/FlashCardScreen';
import { StatsScreen } from '../screens/StatsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#4F46E5' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'LinguaAI' }} />
      <Stack.Screen name="WordList" component={WordListScreen} options={{ title: 'Kelimelerim' }} />
      <Stack.Screen name="AddWord" component={AddWordScreen} options={{ title: 'Kelime Ekle' }} />
      <Stack.Screen name="FlashCard" component={FlashCardScreen} options={{ title: 'Tekrar' }} />
      <Stack.Screen name="Stats" component={StatsScreen} options={{ title: 'İstatistikler' }} />
    </Stack.Navigator>
  </NavigationContainer>
);
