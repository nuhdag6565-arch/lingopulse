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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiForgotPassword, apiResetPassword } from '@/src/api/auth';
import { AppColors } from '@/src/constants/colors';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 1
  const emailRef = useRef('');

  // Step 2
  const codeRef = useRef('');
  const newPasswordRef = useRef('');
  const confirmPasswordRef = useRef('');
  const sentEmail = useRef('');

  const codeInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmInputRef = useRef<TextInput>(null);

  const handleSendCode = async () => {
    const email = emailRef.current.trim();
    if (!email) {
      Alert.alert('Hata', 'Lütfen e-posta adresinizi girin.');
      return;
    }
    setLoading(true);
    try {
      await apiForgotPassword(email);
      sentEmail.current = email;
      setStep('reset');
    } catch {
      Alert.alert('Hata', 'Kod gönderilemedi. Bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const code = codeRef.current.trim();
    const newPassword = newPasswordRef.current;
    const confirmPassword = confirmPasswordRef.current;

    if (!code || code.length !== 4) {
      Alert.alert('Hata', '4 haneli kodu eksiksiz girin.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Hata', 'Şifre en az 8 karakter olmalıdır.');
      return;
    }
    if (/[ğüşıöçĞÜŞİÖÇ]/.test(newPassword)) {
      Alert.alert('Hata', 'Şifre Türkçe karakter içeremez.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }
    setLoading(true);
    try {
      await apiResetPassword(sentEmail.current, code, newPassword);
      Alert.alert(
        'Başarılı',
        'Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz.',
        [{ text: 'Giriş Yap', onPress: () => router.replace('/(auth)/login') }],
      );
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      Alert.alert('Hata', detail ?? 'Kod hatalı veya süresi dolmuş.');
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
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Geri butonu */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (step === 'reset' ? setStep('email') : router.back())}
        >
          <Ionicons name="arrow-back" size={22} color={AppColors.primary} />
          <Text style={styles.backText}>
            {step === 'reset' ? 'Farklı e-posta' : 'Geri'}
          </Text>
        </TouchableOpacity>

        {step === 'email' ? (
          <View style={styles.content}>
            <Text style={styles.icon}>🔑</Text>
            <Text style={styles.title}>Şifremi Unuttum</Text>
            <Text style={styles.description}>
              Kayıtlı e-posta adresinizi girin. Size 6 haneli bir sıfırlama kodu göndereceğiz.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-posta</Text>
              <TextInput
                style={styles.input}
                placeholder="ornek@email.com"
                placeholderTextColor={AppColors.textMuted}
                onChangeText={(t) => { emailRef.current = t; }}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSendCode}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleSendCode}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Kod Gönder</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            <Text style={styles.icon}>📩</Text>
            <Text style={styles.title}>Kodu Girin</Text>
            <Text style={styles.description}>
              <Text style={styles.emailHighlight}>{sentEmail.current}</Text>
              {' '}adresine gönderilen 4 haneli kodu ve yeni şifrenizi girin.{'\n'}
              <Text style={styles.hint}>Gelen kutunuzu ve spam klasörünüzü kontrol edin.</Text>
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>4 Haneli Kod</Text>
              <TextInput
                ref={codeInputRef}
                style={[styles.input, styles.codeInput]}
                placeholder="0000"
                placeholderTextColor={AppColors.textMuted}
                onChangeText={(t) => { codeRef.current = t; }}
                keyboardType="number-pad"
                maxLength={4}
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                submitBehavior="submit"
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Yeni Şifre</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  ref={passwordInputRef}
                  style={styles.passwordInput}
                  placeholder="En az 8 karakter"
                  placeholderTextColor={AppColors.textMuted}
                  onChangeText={(t) => { newPasswordRef.current = t; }}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmInputRef.current?.focus()}
                  submitBehavior="submit"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={AppColors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Yeni Şifre Tekrar</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  ref={confirmInputRef}
                  style={styles.passwordInput}
                  placeholder="Şifrenizi tekrar girin"
                  placeholderTextColor={AppColors.textMuted}
                  onChangeText={(t) => { confirmPasswordRef.current = t; }}
                  secureTextEntry={!showConfirm}
                  returnKeyType="done"
                  onSubmitEditing={handleResetPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowConfirm((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={AppColors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Şifremi Sıfırla</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendRow}
              onPress={() => setStep('email')}
            >
              <Text style={styles.resendText}>Kodu almadım, tekrar gönder</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 36,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.primary,
  },
  content: {
    gap: 20,
  },
  icon: {
    fontSize: 56,
    textAlign: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: AppColors.textPrimary,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  hint: {
    fontSize: 13,
    color: AppColors.textMuted,
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
  codeInput: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: AppColors.textPrimary,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  primaryBtn: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  resendRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
  },
});
