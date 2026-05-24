import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { useWords } from '@/src/context/WordContext';
import { apiChangePassword } from '@/src/api/auth';
import { AppColors } from '@/src/constants/colors';

function SettingRow({
  icon,
  iconColor = AppColors.primary,
  iconBg = '#EEF2FF',
  label,
  subtitle,
  onPress,
  rightEl,
}: {
  icon: string;
  iconColor?: string;
  iconBg?: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  rightEl?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={19} color={iconColor} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {rightEl ?? (onPress ? (
        <Ionicons name="chevron-forward" size={16} color={AppColors.textMuted} />
      ) : null)}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, logout, updateProfile, updatePreferences } = useAuth();
  const { reset } = useWords();

  // Derive initial values from backend-loaded user preferences
  const prefs = user?.preferences;
  const [darkMode, setDarkMode] = useState(prefs?.darkMode ?? false);
  const [accent, setAccent] = useState<'us' | 'uk'>((prefs?.ttsAccent as 'us' | 'uk') ?? 'us');

  // Password modal state
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Preference handlers (save to backend, update UI) ──────────────────────
  const handleDarkMode = useCallback(async (val: boolean) => {
    setDarkMode(val);
    try {
      await updatePreferences({ darkMode: val });
    } catch (e: any) {
      setDarkMode(!val);
      Alert.alert('Hata', e?.response?.data?.detail ?? e?.message ?? 'Ayar kaydedilemedi.');
    }
  }, [updatePreferences]);

  const handleAccent = useCallback(async (val: 'us' | 'uk') => {
    const prev = accent;
    setAccent(val);
    try {
      await updatePreferences({ ttsAccent: val });
    } catch (e: any) {
      setAccent(prev);
      Alert.alert('Hata', e?.response?.data?.detail ?? e?.message ?? 'Ayar kaydedilemedi.');
    }
  }, [accent, updatePreferences]);

  // ── Password change ────────────────────────────────────────────────────────
  const handleChangePassword = useCallback(async () => {
    if (!oldPwd || !newPwd || !confirmPwd) {
      Alert.alert('Hata', 'Tüm alanları doldurun.');
      return;
    }
    if (newPwd !== confirmPwd) {
      Alert.alert('Hata', 'Yeni şifreler eşleşmiyor.');
      return;
    }
    if (newPwd.length < 8) {
      Alert.alert('Hata', 'Yeni şifre en az 8 karakter olmalıdır.');
      return;
    }
    setPwdLoading(true);
    try {
      await apiChangePassword(oldPwd, newPwd);
      setShowPwdModal(false);
      setOldPwd(''); setNewPwd(''); setConfirmPwd('');
      Alert.alert('Başarılı', 'Şifreniz güncellendi.');
    } catch (e: any) {
      Alert.alert('Hata', e?.response?.data?.detail ?? 'Bir sorun oluştu.');
    } finally {
      setPwdLoading(false);
    }
  }, [oldPwd, newPwd, confirmPwd]);

  const closePwdModal = useCallback(() => {
    setShowPwdModal(false);
    setOldPwd(''); setNewPwd(''); setConfirmPwd('');
  }, []);

  // ── Profile update ─────────────────────────────────────────────────────────
  const openProfileModal = useCallback(() => {
    setFullName(user?.fullName ?? '');
    setShowProfileModal(true);
  }, [user?.fullName]);

  const handleUpdateProfile = useCallback(async () => {
    if (!fullName.trim()) {
      Alert.alert('Hata', 'Ad boş bırakılamaz.');
      return;
    }
    setProfileLoading(true);
    try {
      await updateProfile(fullName.trim());
      setShowProfileModal(false);
      Alert.alert('Başarılı', 'Bilgileriniz güncellendi.');
    } catch (e: any) {
      Alert.alert('Hata', e?.response?.data?.detail ?? 'Bir sorun oluştu.');
    } finally {
      setProfileLoading(false);
    }
  }, [fullName, updateProfile]);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    Alert.alert(
      'Oturumu Kapat',
      'Hesabından çıkmak istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => { reset(); await logout(); },
        },
      ],
    );
  }, [reset, logout]);

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color={AppColors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ayarlar</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* ── HESAP ─────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>HESAP</Text>
        <View style={styles.group}>
          <SettingRow
            icon="lock-closed-outline"
            label="Şifre Değiştir"
            onPress={() => setShowPwdModal(true)}
          />
          <View style={styles.sep} />
          <SettingRow
            icon="person-outline"
            label="Kişisel Bilgiler"
            subtitle={user?.fullName}
            onPress={openProfileModal}
          />
        </View>

        {/* ── TERCİHLER ─────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>TERCİHLER</Text>
        <View style={styles.group}>

          {/* Accent */}
          <View style={styles.stackedItem}>
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="language-outline" size={19} color={AppColors.primary} />
              </View>
              <Text style={styles.rowLabel}>Ses Aksanı</Text>
            </View>
            <View style={styles.accentRow}>
              {(['us', 'uk'] as const).map((val) => {
                const active = accent === val;
                const labels = {
                  us: { short: 'US', long: 'Amerikan' },
                  uk: { short: 'UK', long: 'İngiliz' },
                };
                return (
                  <TouchableOpacity
                    key={val}
                    style={[styles.accentChip, active && styles.accentChipActive]}
                    onPress={() => handleAccent(val)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.accentShort, active && styles.accentShortActive]}>
                      {labels[val].short}
                    </Text>
                    <Text style={[styles.accentLong, active && styles.accentLongActive]}>
                      {labels[val].long}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.sep} />

          {/* Dark mode */}
          <SettingRow
            icon="moon-outline"
            label="Karanlık Mod"
            rightEl={
              <Switch
                value={darkMode}
                onValueChange={handleDarkMode}
                trackColor={{ false: AppColors.border, true: AppColors.primaryLight }}
                thumbColor={darkMode ? AppColors.primary : '#f4f3f4'}
              />
            }
          />
        </View>

        {/* ── TEHLİKELİ BÖLGE ───────────────────────────────────── */}
        <Text style={styles.sectionLabel}>TEHLİKELİ BÖLGE</Text>
        <View style={styles.group}>
          <SettingRow
            icon="log-out-outline"
            iconColor="#DC2626"
            iconBg="#FEE2E2"
            label="Oturumu Kapat"
            onPress={handleLogout}
            rightEl={<Ionicons name="chevron-forward" size={16} color="#DC2626" />}
          />
        </View>

        <Text style={styles.version}>LingoPulse v1.0</Text>
      </ScrollView>

      {/* ── Şifre Değiştir Modal ─────────────────────────────────── */}
      <Modal
        visible={showPwdModal}
        transparent
        animationType="slide"
        onRequestClose={closePwdModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closePwdModal} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Şifre Değiştir</Text>

            <Text style={styles.inputLabel}>Mevcut Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder="Mevcut şifrenizi girin"
              placeholderTextColor={AppColors.textMuted}
              secureTextEntry
              value={oldPwd}
              onChangeText={setOldPwd}
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Yeni Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder="En az 8 karakter"
              placeholderTextColor={AppColors.textMuted}
              secureTextEntry
              value={newPwd}
              onChangeText={setNewPwd}
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Yeni Şifre (Tekrar)</Text>
            <TextInput
              style={styles.input}
              placeholder="Yeni şifreyi tekrar girin"
              placeholderTextColor={AppColors.textMuted}
              secureTextEntry
              value={confirmPwd}
              onChangeText={setConfirmPwd}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.sheetBtn, pwdLoading && styles.sheetBtnDisabled]}
              onPress={handleChangePassword}
              disabled={pwdLoading}
              activeOpacity={0.85}
            >
              {pwdLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.sheetBtnText}>Şifreyi Güncelle</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Kişisel Bilgiler Modal ────────────────────────────────── */}
      <Modal
        visible={showProfileModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowProfileModal(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Kişisel Bilgiler</Text>

            <Text style={styles.inputLabel}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              placeholder="Adınızı girin"
              placeholderTextColor={AppColors.textMuted}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

            <Text style={styles.inputSubNote}>E-posta: {user?.email}</Text>

            <TouchableOpacity
              style={[styles.sheetBtn, profileLoading && styles.sheetBtnDisabled]}
              onPress={handleUpdateProfile}
              disabled={profileLoading}
              activeOpacity={0.85}
            >
              {profileLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.sheetBtnText}>Kaydet</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scroll: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 60,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },

  group: {
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 24,
    overflow: 'hidden',
  },
  sep: {
    height: 1,
    backgroundColor: AppColors.border,
    marginLeft: 56,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  rowSubtitle: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },

  stackedItem: {
    paddingBottom: 14,
  },

  accentRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 2,
  },
  accentChip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    backgroundColor: AppColors.background,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
  },
  accentChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: AppColors.primary,
  },
  accentShort: {
    fontSize: 15,
    fontWeight: '800',
    color: AppColors.textSecondary,
  },
  accentShortActive: { color: AppColors.primary },
  accentLong: {
    fontSize: 11,
    color: AppColors.textMuted,
    fontWeight: '500',
  },
  accentLongActive: { color: AppColors.primaryLight },

  version: {
    textAlign: 'center',
    fontSize: 12,
    color: AppColors.textMuted,
    marginTop: 8,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: AppColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: AppColors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: AppColors.textPrimary,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: AppColors.background,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: AppColors.textPrimary,
    marginBottom: 14,
  },
  inputSubNote: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginBottom: 20,
  },
  sheetBtn: {
    backgroundColor: AppColors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  sheetBtnDisabled: { opacity: 0.6 },
  sheetBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
