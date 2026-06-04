import { useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useAppColors, type AppColorsType } from '@/src/context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STEPS = [
  {
    icon: '📖',
    title: 'Konuya Göre Organize Et',
    description: 'İş İngilizcesi, IELTS, seyahat… Her konu için ayrı liste oluştur, kelimeni ve Türkçe anlamını ekle.',
  },
  {
    icon: '🔊',
    title: 'Telaffuzu Doğru Öğren',
    description: 'Her kelimenin sesini tek dokunuşla duy. Doğru telaffuzu kulağına kazıyarak öğrenmeyi hızlandır.',
  },
  {
    icon: '🧠',
    title: 'Akıllı Tekrar ile Ezberle',
    description: 'SM-2 algoritması hangi kelimeyi ne zaman tekrar edeceğini bilir. Doğru zamanda çalış, kısa sürede çok kelime öğren.',
  },
];

const createStyles = (c: AppColorsType) => StyleSheet.create({
  container: {
    flex: 1, backgroundColor: c.background,
    paddingHorizontal: 32, paddingTop: 60, paddingBottom: 48,
  },
  skipRow: { alignItems: 'flex-end' },
  skipText: { fontSize: 15, color: c.textMuted, fontWeight: '600' },
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 20, maxWidth: SCREEN_WIDTH - 64,
  },
  icon: { fontSize: 80 },
  title: { fontSize: 26, fontWeight: '800', color: c.textPrimary, textAlign: 'center' },
  description: { fontSize: 16, color: c.textSecondary, textAlign: 'center', lineHeight: 24 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.border },
  dotActive: { backgroundColor: c.primary, width: 24 },
  footer: { gap: 12 },
  primaryBtn: { backgroundColor: c.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { borderWidth: 1.5, borderColor: c.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  secondaryBtnText: { color: c.primary, fontSize: 16, fontWeight: '700' },
});

export default function OnboardingScreen() {
  const c = useAppColors();
  const styles = useMemo(() => createStyles(c), [c]);
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goTo = (nextStep: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setStep(nextStep);
  };

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <View style={styles.container}>
      <View style={styles.skipRow}>
        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.skipText}>Atla</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.icon}>{current.icon}</Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.description}>{current.description}</Text>
      </Animated.View>

      <View style={styles.dotsRow}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        {isLast ? (
          <>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/(auth)/register')} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Hesap Oluştur</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace('/(auth)/login')} activeOpacity={0.85}>
              <Text style={styles.secondaryBtnText}>Giriş Yap</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => goTo(step + 1)} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>İleri →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
