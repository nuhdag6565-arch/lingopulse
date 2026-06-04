import { useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { useWords } from '@/src/context/WordContext';
import { useAppColors, type AppColorsType } from '@/src/context/ThemeContext';

const createStyles = (c: AppColorsType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  scroll: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 22, fontWeight: '800', color: c.textPrimary },
  subGreeting: { fontSize: 14, color: c.textSecondary, marginTop: 3 },
  logoChip: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  loadingRow: { paddingVertical: 24, alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, gap: 6, alignItems: 'flex-start' },
  statValue: { fontSize: 28, fontWeight: '800', color: c.primary },
  statLabel: { fontSize: 13, fontWeight: '600', color: c.textSecondary },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: c.textPrimary },
  seeAll: { fontSize: 13, fontWeight: '600', color: c.primary },
  listCard: {
    backgroundColor: c.surface, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8,
    borderWidth: 1, borderColor: c.border,
  },
  listIcon: { fontSize: 22 },
  listCardCenter: { flex: 1 },
  listName: { fontSize: 15, fontWeight: '700', color: c.textPrimary },
  listCount: { fontSize: 12, color: c.textSecondary, marginTop: 2 },
  quickCard: {
    backgroundColor: c.surface, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', gap: 8, borderWidth: 1, borderColor: c.border,
  },
  quickLabel: { fontSize: 12, fontWeight: '600', color: c.textPrimary },
});

export default function DashboardScreen() {
  const { user } = useAuth();
  const { lists, isLoadingLists, loadLists } = useWords();
  const c = useAppColors();
  const styles = useMemo(() => createStyles(c), [c]);

  useFocusEffect(useCallback(() => { loadLists(); }, [loadLists]));

  const firstName = user?.fullName?.split(' ')[0] ?? 'Kullanıcı';
  const initials = user?.fullName
    ? user.fullName.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('')
    : 'LP';
  const totalWords = lists.reduce((sum, l) => sum + l.wordCount, 0);
  const recentLists = lists.slice(0, 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba, {firstName} 👋</Text>
          <Text style={styles.subGreeting}>Bugün ne öğrenmek istersin?</Text>
        </View>
        <View style={styles.logoChip}>
          <Text style={styles.logoText}>{initials}</Text>
        </View>
      </View>

      {isLoadingLists && lists.length === 0 ? (
        <View style={styles.loadingRow}><ActivityIndicator color={c.primary} /></View>
      ) : (
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="library" size={22} color={c.primary} />
            <Text style={styles.statValue}>{lists.length}</Text>
            <Text style={styles.statLabel}>Liste</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="text" size={22} color="#059669" />
            <Text style={[styles.statValue, { color: '#059669' }]}>{totalWords}</Text>
            <Text style={[styles.statLabel, { color: '#065F46' }]}>Kelime</Text>
          </View>
        </View>
      )}

      {recentLists.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Liste</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/lists' as any)}>
              <Text style={styles.seeAll}>Tümünü Gör →</Text>
            </TouchableOpacity>
          </View>
          {recentLists.map((item) => (
            <TouchableOpacity key={item.id} style={styles.listCard} onPress={() => router.push(`/list/${item.id}` as any)} activeOpacity={0.88}>
              <Text style={styles.listIcon}>📖</Text>
              <View style={styles.listCardCenter}>
                <Text style={styles.listName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.listCount}>{item.wordCount} kelime</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/create-list')} activeOpacity={0.85}>
          <Ionicons name="add-circle-outline" size={24} color={c.primary} />
          <Text style={styles.quickLabel}>Yeni Liste</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
