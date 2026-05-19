import { useRef, useState } from 'react';
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
import { useAuth } from '@/src/context/AuthContext';
import { AppColors } from '@/src/constants/colors';

export default function RegisterScreen() {
  const { register } = useAuth();

  // Uncontrolled: values live in refs, never passed back as `value` prop
  const fullNameRef = useRef('');
  const emailRef = useRef('');
  const passwordRef = useRef('');
  const confirmRef = useRef('');

  // Only this drives a re-render — shown below confirm field
  const [mismatch, setMismatch] = useState(false);
  const [loading, setLoading] = useState(false);

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
    if (password !== confirm) {
      setMismatch(true);
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }
    setLoading(true);
    try {
      await register(fullName, email, password);
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Kayıt Başarısız', 'Bir hata oluştu. Lütfen tekrar dene.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
              placeholderTextColor={AppColors.textMuted}
              onChangeText={(t) => { fullNameRef.current = t; }}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              onSubmitEditing={() => emailInputRef.current?.focus()}
              submitBehavior="submit"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-posta</Text>
            <TextInput
              ref={emailInputRef}
              style={styles.input}
              placeholder="ornek@email.com"
              placeholderTextColor={AppColors.textMuted}
              onChangeText={(t) => { emailRef.current = t; }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              submitBehavior="submit"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre</Text>
            <TextInput
              ref={passwordInputRef}
              style={styles.input}
              placeholder="En az 6 karakter"
              placeholderTextColor={AppColors.textMuted}
              onChangeText={(t) => {
                passwordRef.current = t;
                if (mismatch) setMismatch(false);
              }}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => confirmInputRef.current?.focus()}
              submitBehavior="submit"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre Tekrar</Text>
            <TextInput
              ref={confirmInputRef}
              style={[styles.input, mismatch && styles.inputError]}
              placeholder="Şifrenizi tekrar girin"
              placeholderTextColor={AppColors.textMuted}
              onChangeText={(t) => {
                confirmRef.current = t;
                setMismatch(t.length > 0 && t !== passwordRef.current);
              }}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />
            {mismatch && (
              <Text style={styles.errorText}>Şifreler eşleşmiyor</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            )}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: AppColors.primary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  input: {
    backgroundColor: AppColors.surface,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: AppColors.textPrimary,
  },
  inputError: {
    borderColor: AppColors.error,
  },
  errorText: {
    fontSize: 12,
    color: AppColors.error,
    marginTop: 2,
  },
  button: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 15,
    color: AppColors.textSecondary,
  },
  link: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.primary,
  },
});
