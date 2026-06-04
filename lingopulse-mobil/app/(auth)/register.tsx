import { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { useAppColors, type AppColorsType } from '@/src/context/ThemeContext';

const createStyles = (c: AppColorsType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
  header: { alignItems: 'center', marginBottom: 36 },
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
  passwordRowError: { borderColor: c.error },
  passwordInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: c.textPrimary },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 14 },
  passwordHints: { gap: 3, paddingTop: 2 },
  hintItem: { fontSize: 12, color: c.textMuted },
  errorText: { fontSize: 12, color: c.error, marginTop: 2 },
  button: { backgroundColor: c.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontSize: 15, color: c.textSecondary },
  link: { fontSize: 15, fontWeight: '700', color: c.primary },
});

export default function RegisterScreen() {
  const { register } = useAuth();
  const c = useAppColors();
  const styles = useMemo(() => createStyles(c), [c]);

  const fullNameRef = useRef('');
  const emailRef = useRef('');
  const passwordRef = useRef('');
  const confirmRef = useRef('');

  const [mismatch, setMismatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmInputRef = useRef<TextInput>(null);

  const handleRegister = async () => {
    const fullName = fullNameRef.current.trim();
    const email = emailRef.current.trim();
    const password = passwordRef.current;
    const confirm = confirmRef.current;

    if (!fullName || !email || !password || !confirm) {
      Alert.alert('Hata', 'Tüm alanlar zorunludur.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Hata', 'Şifre en az 8 karakter olmalıdır.');
      return;
    }
    if (/[ğüşıöçĞÜŞİÖÇ]/.test(password)) {
      Alert.alert('Hata', 'Şifre Türkçe karakter içeremez (ğ, ü, ş, ı, ö, ç).');
      return;
    }
    if (password !== confirm) {
      setMismatch(true);
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }
    setLoading(true);
    try {
      await register(fullName, email, password);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        Alert.alert('Kayıt Başarısız', 'Bu e-posta adresi zaten kullanılıyor.');
      } else if (status === 422) {
        Alert.alert('Kayıt Başarısız', 'Geçersiz e-posta veya şifre formatı.');
      } else {
        Alert.alert('Kayıt Başarısız', 'Bağlantı hatası. Sunucuya ulaşılamıyor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.logo}>LingoPulse</Text>
          <Text style={styles.subtitle}>Hesap oluştur</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              placeholder="Adınız Soyadınız"
              placeholderTextColor={c.textMuted}
              onChangeText={(t) => { fullNameRef.current = t; }}
              autoCapitalize="none"
              spellCheck={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-posta</Text>
            <TextInput
              ref={emailInputRef}
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
                placeholder="En az 8 karakter"
                placeholderTextColor={c.textMuted}
                onChangeText={(t) => { passwordRef.current = t; if (mismatch) setMismatch(false); }}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmInputRef.current?.focus()}
                submitBehavior="submit"
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={c.textMuted} />
              </TouchableOpacity>
            </View>
            <View style={styles.passwordHints}>
              <Text style={styles.hintItem}>• En az 8 karakter olmalı</Text>
              <Text style={styles.hintItem}>• Harf ve rakam karışımı önerilir</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre Tekrar</Text>
            <View style={[styles.passwordRow, mismatch && styles.passwordRowError]}>
              <TextInput
                ref={confirmInputRef}
                style={styles.passwordInput}
                placeholder="Şifrenizi tekrar girin"
                placeholderTextColor={c.textMuted}
                onChangeText={(t) => { confirmRef.current = t; setMismatch(t.length > 0 && t !== passwordRef.current); }}
                secureTextEntry={!showConfirm}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={22} color={c.textMuted} />
              </TouchableOpacity>
            </View>
            {mismatch && <Text style={styles.errorText}>Şifreler eşleşmiyor</Text>}
          </View>

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Kayıt Ol</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Giriş Yap</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
