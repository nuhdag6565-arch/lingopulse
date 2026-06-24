import { useMemo, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '@/src/context/AuthContext';
import { useWords } from '@/src/context/WordContext';
import { useAppColors, type AppColorsType } from '@/src/context/ThemeContext';

const STREAK_DATE_KEY  = 'lp_streak_date';
const STREAK_COUNT_KEY = 'lp_streak_count';

function getInitials(fullName?: string) {
  if (!fullName) return '?';
  return fullName.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

async function loadOrUpdateStreak(): Promise<number> {
  const today     = todayStr();
  const lastDate  = await SecureStore.getItemAsync(STREAK_DATE_KEY);
  const lastCount = parseInt((await SecureStore.getItemAsync(STREAK_COUNT_KEY)) ?? '0', 10);

  if (lastDate === today) return lastCount;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);

  const newCount = lastDate === yStr ? lastCount + 1 : 1;
  await SecureStore.setItemAsync(STREAK_DATE_KEY,  today);
  await SecureStore.setItemAsync(STREAK_COUNT_KEY, String(newCount));
  return newCount;
}

const createStyles = (c: AppColorsType) => StyleSheet.create({
  container:  { flex: 1, backgroundColor: c.background },
  scroll:     { paddingBottom: 80 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: c.textPrimary },
  gearBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: c.surface,
    borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center',
  },

  // Hero card
  heroCard: {
    marginHorizontal: 16, marginBottom: 20, borderRadius: 24,
    backgroundColor: c.primary, padding: 24,
    shadowColor: c.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
  },
  heroRow:   { flexDirection: 'row', alignItems: 'center', gap: 18 },
  avatar: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText:  { color: '#fff', fontSize: 26, fontWeight: '800' },
  heroInfo:    { flex: 1 },
  heroName:    { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 3 },
  heroEmail:   { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  heroBadge: {
    marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20,
    paddingVertical: 4, paddingHorizontal: 10, alignSelf: 'flex-start',
  },
  heroBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  // Section
  sectionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 12, marginTop: 4,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: c.textPrimary },

  // Stat cards
  statsGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1, borderRadius: 20, padding: 16, alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  statIconWrap: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  statValue: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontWeight: '600', color: c.textSecondary, textAlign: 'center' },

  // Progress
  progressCard: {
    marginHorizontal: 16, marginBottom: 20, borderRadius: 20,
    backgroundColor: c.surface, padding: 18,
    borderWidth: 1, borderColor: c.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressTitle:  { fontSize: 14, fontWeight: '700', color: c.textPrimary },
  progressPct:    { fontSize: 14, fontWeight: '800', color: c.primary },
  progressTrack:  { height: 10, borderRadius: 5, backgroundColor: c.border, overflow: 'hidden' },
  progressFill:   { height: 10, borderRadius: 5, backgroundColor: c.primary },
  progressSub: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 8,
  },
  progressSubText: { fontSize: 12, color: c.textSecondary },

  // Lists preview
  listPreviewCard: {
    marginHorizontal: 16, marginBottom: 10, borderRadius: 16,
    backgroundColor: c.surface, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: c.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  listPreviewLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  listPreviewIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: c.primary + '18', alignItems: 'center', justifyContent: 'center',
  },
  listPreviewName:  { fontSize: 14, fontWeight: '700', color: c.textPrimary },
  listPreviewCount: { fontSize: 12, color: c.textSecondary, marginTop: 2 },

  // Settings row
  settingsCard: {
    marginHorizontal: 16, marginBottom: 10, borderRadius: 16,
    backgroundColor: c.surface, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: c.border,
  },
  settingsLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: c.border, alignItems: 'center', justifyContent: 'center',
  },
  settingsText: { fontSize: 14, fontWeight: '600', color: c.textPrimary },

  version: { textAlign: 'center', fontSize: 12, color: c.textMuted, marginTop: 16, marginBottom: 8 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
});

export default function ProfileScreen() {
  const { user } = useAuth();
  const { lists, loadLists } = useWords();
  const c = useAppColors();
  const styles = useMemo(() => createStyles(c), [c]);

  const [streak,     setStreak]     = useState(0);
  const [statsReady, setStatsReady] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    setStatsReady(false);
    loadLists().then(() => { if (active) setStatsReady(true); });
    loadOrUpdateStreak().then((s) => { if (active) setStreak(s); });
    return () => { active = false; };
  }, [loadLists]));

  const totalWords = lists.reduce((s, l) => s + l.wordCount, 0);
  const initials   = getInitials(user?.fullName);

  const previewLists = lists.slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
        <TouchableOpacity style={styles.gearBtn} onPress={() => router.push('/settings')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="settings-outline" size={22} color={c.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Hero card */}
      <View style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName} numberOfLines={1}>{user?.fullName ?? 'Kullanıcı'}</Text>
            <Text style={styles.heroEmail} numberOfLines={1}>{user?.email ?? ''}</Text>
            <View style={styles.heroBadge}>
              <Text>🏆</Text>
              <Text style={styles.heroBadgeText}>LingoPulse Üyesi</Text>
            </View>
          </View>
        </View>
      </View>

      {/* İstatistikler */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>İstatistikler</Text>
      </View>

      {!statsReady ? (
        <View style={styles.loading}><ActivityIndicator color={c.primary} /></View>
      ) : (
        <View style={styles.statsGrid}>
          {/* Toplam Kelime */}
          <View style={[styles.statCard, { backgroundColor: '#EEF2FF' }]}>
            <View style={[styles.statIconWrap, { backgroundColor: '#C7D2FE' }]}>
              <Ionicons name="book-outline" size={20} color={c.primary} />
            </View>
            <Text style={[styles.statValue, { color: c.primary }]}>{totalWords}</Text>
            <Text style={styles.statLabel}>Toplam{'\n'}Kelime</Text>
          </View>

          {/* Liste Sayısı */}
          <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
            <View style={[styles.statIconWrap, { backgroundColor: '#BBF7D0' }]}>
              <Ionicons name="library-outline" size={20} color="#16A34A" />
            </View>
            <Text style={[styles.statValue, { color: '#16A34A' }]}>{lists.length}</Text>
            <Text style={[styles.statLabel, { color: '#15803D' }]}>Kelime{'\n'}Listesi</Text>
          </View>

          {/* Günlük Seri */}
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <View style={[styles.statIconWrap, { backgroundColor: '#FDE68A' }]}>
              <Ionicons name="flame-outline" size={20} color="#D97706" />
            </View>
            <Text style={[styles.statValue, { color: '#D97706' }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: '#92400E' }]}>Günlük{'\n'}Seri</Text>
          </View>
        </View>
      )}

      {/* Listelerim önizleme */}
      {previewLists.length > 0 && (
        <>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Listelerim</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/lists')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: c.primary }}>Tümü →</Text>
            </TouchableOpacity>
          </View>
          {previewLists.map((list) => (
            <TouchableOpacity
              key={list.id}
              style={styles.listPreviewCard}
              onPress={() => router.push(`/list/${list.id}` as any)}
              activeOpacity={0.85}
            >
              <View style={styles.listPreviewLeft}>
                <View style={styles.listPreviewIcon}>
                  <Ionicons name="library-outline" size={18} color={c.primary} />
                </View>
                <View>
                  <Text style={styles.listPreviewName} numberOfLines={1}>{list.name}</Text>
                  <Text style={styles.listPreviewCount}>{list.wordCount} kelime</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Ayarlar */}
      <View style={{ marginTop: 8 }}>
        <TouchableOpacity style={styles.settingsCard} onPress={() => router.push('/settings')} activeOpacity={0.85}>
          <View style={styles.settingsLeft}>
            <View style={styles.settingsIcon}>
              <Ionicons name="settings-outline" size={18} color={c.textSecondary} />
            </View>
            <Text style={styles.settingsText}>Ayarlar</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>LingoPulse v1.0</Text>
    </ScrollView>
  );
}
