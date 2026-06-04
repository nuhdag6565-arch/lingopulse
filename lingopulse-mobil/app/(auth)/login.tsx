import { useMemo, useRef, useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '@/src/context/AuthContext';
import { useAppColors, type AppColorsType } from '@/src/context/ThemeContext';
import { isFirebaseConfigured } from '@/src/config/firebase';

WebBrowser.maybeCompleteAuthSession();

// Env değerleri
const GOOGLE_WEB_ID     = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID     ?? '';
const GOOGLE_ANDROID_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';
const GOOGLE_IOS_ID     = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID     ?? '';

const isGoogleReady = isFirebaseConfigured &&
  GOOGLE_WEB_ID.length > 0 &&
  (Platform.OS === 'ios' ? GOOGLE_IOS_ID.length > 0 : GOOGLE_ANDROID_ID.length > 0);

const createStyles = (c: AppColorsType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
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
  passwordInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: c.textPrimary },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 14 },
  forgotRow: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { fontSize: 13, fontWeight: '600', color: c.primary },
  loginBtn: { backgroundColor: c.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: c.border },
  dividerText: { fontSize: 13, color: c.textMuted, fontWeight: '500' },
  socialGroup: { gap: 10 },
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: c.surface, borderRadius: 12, paddingVertical: 14,
    borderWidth: 1.5, borderColor: c.border,
  },
  socialBtnDisabled: { opacity: 0.45 },
  socialBtnText: { fontSize: 15, fontWeight: '600', color: c.textPrimary },
  appleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#000', borderRadius: 12, paddingVertical: 14,
  },
  appleBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  footerText: { fontSize: 15, color: c.textSecondary },
  link: { fontSize: 15, fontWeight: '700', color: c.primary },
});

function getFirebaseError(code?: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':   return 'E-posta veya şifre hatalı.';
    case 'auth/too-many-requests':    return 'Çok fazla başarısız deneme. Daha sonra tekrar deneyin.';
    case 'auth/network-request-failed': return 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
    case 'auth/user-disabled':        return 'Bu hesap devre dışı.';
    default:                          return 'Bir sorun oluştu. Lütfen tekrar deneyin.';
  }
}

// ── Google Sign-In — hook sadece client ID'ler tanımlıysa bu bileşende çalışır ──
function GoogleSignInButton({ busy, onBusyChange }: { busy: boolean; onBusyChange: (v: boolean) => void }) {
  const { loginWithGoogle } = useAuth();
  const c = useAppColors();
  const s = useMemo(() => StyleSheet.create({
    btn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
      backgroundColor: c.surface, borderRadius: 12, paddingVertical: 14,
      borderWidth: 1.5, borderColor: c.border, opacity: busy ? 0.45 : 1,
    },
    text: { fontSize: 15, fontWeight: '600', color: c.textPrimary },
  }), [c, busy]);

  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId:     GOOGLE_WEB_ID     || undefined,
    androidClientId: GOOGLE_ANDROID_ID || undefined,
    iosClientId:     GOOGLE_IOS_ID     || undefined,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params?.id_token;
      if (!idToken) return;
      onBusyChange(true);
      loginWithGoogle(idToken)
        .then(() => router.replace('/(tabs)'))
        .catch((err: unknown) => {
          Alert.alert('Google Girişi Başarısız', getFirebaseError((err as { code?: string })?.code));
        })
        .finally(() => onBusyChange(false));
    } else if (response?.type === 'error') {
      Alert.alert('Hata', 'Google ile giriş sırasında bir sorun oluştu.');
    }
  }, [response]);

  return (
    <TouchableOpacity style={s.btn} onPress={() => promptAsync()} disabled={busy} activeOpacity={0.85}>
      {busy
        ? <ActivityIndicator color={c.textPrimary} />
        : <><Text style={{ fontSize: 18 }}>🌐</Text><Text style={s.text}>Google ile Giriş Yap</Text></>
      }
    </TouchableOpacity>
  );
}

// ── Yapılandırılmamış halde gösterilen pasif Google butonu ──
function GoogleSignInButtonPlaceholder({ busy }: { busy: boolean }) {
  const c = useAppColors();
  const s = useMemo(() => StyleSheet.create({
    btn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
      backgroundColor: c.surface, borderRadius: 12, paddingVertical: 14,
      borderWidth: 1.5, borderColor: c.border, opacity: 0.45,
    },
    text: { fontSize: 15, fontWeight: '600', color: c.textPrimary },
  }), [c]);

  return (
    <TouchableOpacity
      style={s.btn}
      disabled={busy}
      activeOpacity={0.85}
      onPress={() => Alert.alert(
        'Firebase Gerekli',
        'Google ile giriş için .env.local dosyasına Firebase ve Google Client ID bilgilerini ekleyin.',
      )}
    >
      <Text style={{ fontSize: 18 }}>🌐</Text>
      <Text style={s.text}>Google ile Giriş Yap</Text>
    </TouchableOpacity>
  );
}

export default function LoginScreen() {
  const { login, loginWithApple } = useAuth();
  const c = useAppColors();
  const styles = useMemo(() => createStyles(c), [c]);

  const emailRef = useRef('');
  const passwordRef = useRef('');
  const passwordInputRef = useRef<TextInput>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const busy = loading || googleLoading || appleLoading;

  const handleLogin = async () => {
    const email = emailRef.current.trim();
    const password = passwordRef.current;
    if (!email || !password) { Alert.alert('Hata', 'E-posta ve şifre alanları zorunludur.'); return; }
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const code   = (err as { code?: string })?.code;
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (code)         Alert.alert('Giriş Başarısız', getFirebaseError(code));
      else if (status === 401) Alert.alert('Giriş Başarısız', 'E-posta veya şifre hatalı.');
      else              Alert.alert('Giriş Başarısız', 'Bağlantı hatası. Sunucuya ulaşılamıyor.');
    } finally { setLoading(false); }
  };

  const handleAppleLogin = async () => {
    if (!isFirebaseConfigured) {
      Alert.alert('Firebase Gerekli', 'Apple ile giriş için .env.local dosyasına Firebase bilgilerini ekleyin.');
      return;
    }
    setAppleLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) throw new Error('Apple identity token alınamadı.');
      const fullName = credential.fullName?.givenName
        ? `${credential.fullName.givenName} ${credential.fullName.familyName ?? ''}`.trim()
        : undefined;
      await loginWithApple(credential.identityToken, fullName);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      if ((err as { code?: string })?.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple Girişi Başarısız', 'Apple ile giriş yapılamadı.');
      }
    } finally { setAppleLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.logo}>LingoPulse</Text>
          <Text style={styles.subtitle}>Hesabına giriş yap</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.input} placeholder="ornek@email.com" placeholderTextColor={c.textMuted}
              onChangeText={(t) => { emailRef.current = t; }} keyboardType="email-address"
              autoCapitalize="none" returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()} submitBehavior="submit"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre</Text>
            <View style={styles.passwordRow}>
              <TextInput
                ref={passwordInputRef} style={styles.passwordInput} placeholder="••••••••"
                placeholderTextColor={c.textMuted} onChangeText={(t) => { passwordRef.current = t; }}
                secureTextEntry={!showPassword} returnKeyType="done" onSubmitEditing={handleLogin}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={c.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password' as never)} style={styles.forgotRow}>
            <Text style={styles.forgotText}>Şifremi unuttum</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.loginBtn, busy && styles.loginBtnDisabled]} onPress={handleLogin} disabled={busy} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Giriş Yap</Text>}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>veya şununla devam et</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Sosyal butonlar */}
        <View style={styles.socialGroup}>
          {isGoogleReady
            ? <GoogleSignInButton busy={busy} onBusyChange={setGoogleLoading} />
            : <GoogleSignInButtonPlaceholder busy={busy} />
          }

          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.appleBtn, busy && styles.socialBtnDisabled]}
              onPress={handleAppleLogin} disabled={busy} activeOpacity={0.85}
            >
              {appleLoading
                ? <ActivityIndicator color="#fff" />
                : <><Ionicons name="logo-apple" size={20} color="#fff" /><Text style={styles.appleBtnText}>Apple ile Giriş Yap</Text></>
              }
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hesabın yok mu? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity><Text style={styles.link}>Kayıt Ol</Text></TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
