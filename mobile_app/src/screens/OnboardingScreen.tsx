import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/common/Button';
import type { AuthStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

const STEPS = [
  { emoji: '📚', title: 'Kelime Ekle', desc: 'Öğrenmek istediğin kelimeleri ekle, yapay zeka örnek cümleler üretsin.' },
  { emoji: '🔁', title: 'Spaced Repetition', desc: 'SM-2 algoritması ile her kelimeyi doğru zamanda tekrar et, hafızana kalıcı yaz.' },
  { emoji: '🎯', title: 'Takip Et', desc: 'İstatistiklerle ilerlemenı gör, günlük hedeflerine ulaş.' },
];

export const OnboardingScreen: React.FC = () => {
  const nav = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🧠</Text>
      <Text style={styles.appName}>LingoPulse</Text>
      <Text style={styles.tagline}>Her gün biraz daha iyi</Text>

      <View style={styles.steps}>
        {STEPS.map((s) => (
          <View key={s.title} style={styles.step}>
            <Text style={styles.stepEmoji}>{s.emoji}</Text>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepDesc}>{s.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button label="Başla — Ücretsiz Kayıt Ol" onPress={() => nav.navigate('Register')} />
        <Button
          label="Zaten hesabım var"
          onPress={() => nav.navigate('Login')}
          variant="ghost"
          style={styles.secondaryBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FF', padding: 28, justifyContent: 'center' },
  logo: { fontSize: 64, textAlign: 'center' },
  appName: { fontSize: 32, fontWeight: '900', color: '#1E1B4B', textAlign: 'center', marginTop: 8 },
  tagline: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 40 },
  steps: { gap: 20, marginBottom: 40 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  stepEmoji: { fontSize: 32, width: 44 },
  stepText: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '700', color: '#1E1B4B', marginBottom: 2 },
  stepDesc: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  actions: { gap: 12 },
  secondaryBtn: { borderWidth: 1.5, borderColor: '#4F46E5' },
});
