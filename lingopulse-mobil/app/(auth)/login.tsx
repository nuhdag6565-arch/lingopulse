import { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { useAppColors, type AppColorsType } from '@/src/context/ThemeContext';

const createStyles = (c: AppColorsType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 32, fontWeight: '800', color: c.primary, letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: 16, color: c.textSecondary },
  form: { gap: 16 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: c.textPrimary },
  input: {
    backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: c.textPrimary,
  },
  passwordRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border, borderRadius: 12,
  },
  passwordInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: c.textPrimary },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 14 },
  forgotRow: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { fontSize: 13, fontWeight: '600', color: c.primary },
  button: { backgroundColor: c.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontSize: 15, color: c.textSecondary },
  link: { fontSize: 15, fontWeight: '700', color: c.primary },
});

export default function LoginScreen() {
  const { login } = useAuth();
  const c = useAppColors();
  const styles = useMemo(() => createStyles(c), [c]);
  const emailRef = useRef('');
  const passwordRef = useRef('');
  const passwordInputRef = useRef<TextInput>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    const email = emailRef.current.trim();
    const password = passwordRef.current;
    if (!email || !password) {
      Alert.alert('Hata', 'E-posta ve şifre alanları zorunludur.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        Alert.alert('Giriş Başarısız', 'E-posta veya şifre hatalı.');
      } else {
        Alert.alert('Giriş Başarısız', 'Bağlantı hatası. Sunucuya ulaşılamıyor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.logo}>LingoPulse</Text>
          <Text style={styles.subtitle}>Hesabına giriş yap</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.input}
              placeholder="ornek@email.com"
              placeholderTextColor={c.textMuted}
              onChangeText={(t) => { emailRef.current = t; }}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              submitBehavior="submit"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre</Text>
            <View style={styles.passwordRow}>
              <TextInput
                ref={passwordInputRef}
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor={c.textMuted}
                onChangeText={(t) => { passwordRef.current = t; }}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={c.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password' as never)} style={styles.forgotRow}>
            <Text style={styles.forgotText}>Şifremi unuttum</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Giriş Yap</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hesabın yok mu? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Kayıt Ol</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
