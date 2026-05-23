import { useCallback } from 'react';
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
import { useWords } from '@/src/context/WordContext';
import { AppColors } from '@/src/constants/colors';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { lists, isLoadingLists, loadLists } = useWords();

  useFocusEffect(
    useCallback(() => {
      loadLists();
    }, [loadLists]),
  );

  const firstName = user?.fullName?.split(' ')[0] ?? 'Kullanıcı';
  const totalWords = lists.reduce((sum, l) => sum + l.wordCount, 0);
  const recentLists = lists.slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Karşılama */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba, {firstName} 👋</Text>
          <Text style={styles.subGreeting}>Bugün ne öğrenmek istersin?</Text>
        </View>
        <View style={styles.logoChip}>
          <Text style={styles.logoText}>LP</Text>
        </View>
      </View>

      {/* İstatistik kartları */}
      {isLoadingLists && lists.length === 0 ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={AppColors.primary} />
        </View>
      ) : (
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="library" size={22} color={AppColors.primary} />
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

      {/* Tekrar Başlat butonu */}
      <TouchableOpacity
        style={styles.reviewBtn}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onPress={() => router.push('/(tabs)/review' as any)}
        activeOpacity={0.85}
      >
        <View style={styles.reviewBtnLeft}>
          <Ionicons name="play-circle" size={28} color="#fff" />
          <View>
            <Text style={styles.reviewBtnTitle}>Tekrar Başlat</Text>
            <Text style={styles.reviewBtnSub}>
              {totalWords > 0 ? `${totalWords} kelime seni bekliyor` : 'Kelime ekleyerek başla'}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>

      {/* Son Listeler */}
      {recentLists.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Listeler</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/lists' as any)}>
              <Text style={styles.seeAll}>Tümünü Gör →</Text>
            </TouchableOpacity>
          </View>
          {recentLists.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.listCard}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onPress={() => router.push(`/list/${item.id}` as any)}
              activeOpacity={0.88}
            >
              <Text style={styles.listIcon}>📖</Text>
              <View style={styles.listCardCenter}>
                <Text style={styles.listName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.listCount}>{item.wordCount} kelime</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={AppColors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Hızlı aksiyonlar */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
        <View style={styles.quickRow}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/create-list')}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={24} color={AppColors.primary} />
            <Text style={styles.quickLabel}>Yeni Liste</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onPress={() => router.push('/(tabs)/lists' as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="library-outline" size={24} color={AppColors.primary} />
            <Text style={styles.quickLabel}>Listelerim</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onPress={() => router.push('/(tabs)/profile' as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="person-outline" size={24} color={AppColors.primary} />
            <Text style={styles.quickLabel}>Profilim</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  subGreeting: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginTop: 3,
  },
  logoChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  loadingRow: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: AppColors.primary,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  reviewBtn: {
    backgroundColor: AppColors.primary,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  reviewBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  reviewBtnTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  reviewBtnSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.primary,
  },
  listCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  listIcon: {
    fontSize: 22,
  },
  listCardCenter: {
    flex: 1,
  },
  listName: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  listCount: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  quickCard: {
    flex: 1,
    backgroundColor: AppColors.surface,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
});
