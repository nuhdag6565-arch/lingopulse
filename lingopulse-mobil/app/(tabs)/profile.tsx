import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { useWords, type Word } from '@/src/context/WordContext';
import { useTTS } from '@/src/context/TTSContext';
import { AppColors } from '@/src/constants/colors';

const SPEED_OPTIONS = [
  { value: '0.25', label: 'En Yavaş', desc: '0.25×' },
  { value: '0.5',  label: 'Yavaş',    desc: '0.5×' },
  { value: '0.75', label: 'Orta Yavaş', desc: '0.75×' },
  { value: '1.0',  label: 'Normal',   desc: '1.0×' },
  { value: '1.25', label: 'Hızlı',    desc: '1.25×' },
  { value: '1.5',  label: 'Çok Hızlı', desc: '1.5×' },
  { value: '1.75', label: 'Süper Hızlı', desc: '1.75×' },
  { value: '2.0',  label: 'En Hızlı', desc: '2.0×' },
];

function getInitials(fullName?: string) {
  if (!fullName) return '?';
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { loadAllWords, lists, reset } = useWords();
  const { ttsSpeedValue, setTtsSpeed } = useTTS();

  const [allWords, setAllWords] = useState<Word[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoadingStats(true);

      loadAllWords().then((words) => {
        if (!active) return;
        setAllWords(words);
        setLoadingStats(false);
      });

      return () => { active = false; };
    }, [loadAllWords]),
  );

  const handleSpeedChange = async (val: string) => {
    await setTtsSpeed(val);
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabından çıkmak istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            reset();
            await logout();
          },
        },
      ],
    );
  };

  const totalWords = loadingStats ? 0 : allWords.length;
  const learnedWords = loadingStats
    ? 0
    : allWords.filter((w) => w.easeFactor > 2.5).length;
  const totalLists = lists.length;
  const initials = getInitials(user?.fullName);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── Kullanıcı bilgileri ─────────────────────────────────── */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{user?.fullName ?? 'Kullanıcı'}</Text>
        <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
      </View>

      {/* ─── İstatistik kartları ─────────────────────────────────── */}
      <Text style={styles.sectionTitle}>İstatistikler</Text>

      {loadingStats ? (
        <View style={styles.statsLoading}>
          <ActivityIndicator color={AppColors.primary} />
        </View>
      ) : (
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#EEF2FF' }]}>
            <Text style={styles.statEmoji}>📝</Text>
            <Text style={[styles.statValue, { color: AppColors.primary }]}>{totalWords}</Text>
            <Text style={styles.statLabel}>Toplam{'\n'}Kelime</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={[styles.statValue, { color: '#059669' }]}>{learnedWords}</Text>
            <Text style={[styles.statLabel, { color: '#065F46' }]}>Öğrenilen{'\n'}Kelime</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={[styles.statValue, { color: '#D97706' }]}>0</Text>
            <Text style={[styles.statLabel, { color: '#92400E' }]}>Günlük{'\n'}Seri</Text>
          </View>
        </View>
      )}

      {/* ─── Ses Hızı ────────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Ses Hızı</Text>
      <View style={styles.settingsCard}>
        <View style={styles.speedHeader}>
          <Ionicons name="volume-high-outline" size={20} color={AppColors.textSecondary} />
          <Text style={styles.settingLabel}>Varsayılan Konuşma Hızı</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.speedOptions}
        >
          {SPEED_OPTIONS.map((opt) => {
            const active = ttsSpeedValue === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.speedChip, active && styles.speedChipActive]}
                onPress={() => handleSpeedChange(opt.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.speedChipText, active && styles.speedChipTextActive]}>
                  {opt.label}
                </Text>
                <Text style={[styles.speedChipDesc, active && styles.speedChipDescActive]}>
                  {opt.desc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ─── Özet bilgi ──────────────────────────────────────────── */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Ionicons name="library-outline" size={18} color={AppColors.textSecondary} />
          <Text style={styles.summaryText}>{totalLists} liste oluşturuldu</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Ionicons name="text-outline" size={18} color={AppColors.textSecondary} />
          <Text style={styles.summaryText}>{totalWords} kelime eklendi</Text>
        </View>
      </View>

      {/* ─── Çıkış Butonu ────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        activeOpacity={0.85}
      >
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>

      <Text style={styles.version}>LingoPulse v1.0</Text>
    </ScrollView>
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

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.textPrimary,
    marginBottom: 12,
    marginTop: 4,
  },

  // Stats
  statsLoading: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statEmoji: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 15,
  },

  // Speed setting
  settingsCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 28,
  },
  speedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  speedOptions: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  speedChip: {
    width: 76,
    backgroundColor: AppColors.background,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: AppColors.border,
    gap: 2,
  },
  speedChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: AppColors.primary,
  },
  speedChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textSecondary,
  },
  speedChipTextActive: {
    color: AppColors.primary,
  },
  speedChipDesc: {
    fontSize: 10,
    color: AppColors.textMuted,
  },
  speedChipDescActive: {
    color: AppColors.primaryLight,
  },

  // Summary
  summaryCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 28,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  summaryText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.border,
    marginHorizontal: -16,
  },

  // Logout
  logoutBtn: {
    backgroundColor: AppColors.error,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
    shadowColor: AppColors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  version: {
    textAlign: 'center',
    fontSize: 12,
    color: AppColors.textMuted,
  },
});
