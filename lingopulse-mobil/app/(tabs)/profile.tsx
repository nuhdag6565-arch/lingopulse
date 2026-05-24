import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { useWords, type Word } from '@/src/context/WordContext';
import { AppColors } from '@/src/constants/colors';

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
  const { user } = useAuth();
  const { loadAllWords } = useWords();

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

  const totalWords = loadingStats ? 0 : allWords.length;
  const learnedWords = loadingStats ? 0 : allWords.filter((w) => w.easeFactor > 2.5).length;
  const initials = getInitials(user?.fullName);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── Top row ─────────────────────────────────────────────── */}
      <View style={styles.topRow}>
        <Text style={styles.screenTitle}>Profil</Text>
        <TouchableOpacity
          style={styles.gearBtn}
          onPress={() => router.push('/settings')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="settings-outline" size={23} color={AppColors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ─── Avatar ──────────────────────────────────────────────── */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{user?.fullName ?? 'Kullanıcı'}</Text>
        <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
      </View>

      {/* ─── Stats ───────────────────────────────────────────────── */}
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

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  gearBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 30,
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

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.textPrimary,
    marginBottom: 12,
  },

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
  statEmoji: { fontSize: 20 },
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

  version: {
    textAlign: 'center',
    fontSize: 12,
    color: AppColors.textMuted,
  },
});
