import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { useWords } from '@/src/context/WordContext';
import { WordCard } from '@/src/components/WordCard';
import { EmptyState } from '@/src/components/EmptyState';
import { AppColors } from '@/src/constants/colors';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { words, deleteWord, getDueWords } = useWords();
  const dueCount = getDueWords().length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba, {user?.fullName?.split(' ')[0] ?? 'Kullanıcı'} 👋</Text>
          <Text style={styles.subGreeting}>Bugün ne öğreniyoruz?</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{words.length}</Text>
          <Text style={styles.statLabel}>Toplam Kelime</Text>
        </View>
        <TouchableOpacity
          style={[styles.statCard, styles.reviewCard]}
          onPress={() => router.push('/(tabs)/review')}
          activeOpacity={0.85}
        >
          <Text style={[styles.statNum, { color: '#fff' }]}>{dueCount}</Text>
          <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}>Tekrar Bekliyor</Text>
          {dueCount > 0 && <Text style={styles.reviewArrow}>→</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Kelime Havuzum</Text>
        <Text style={styles.listCount}>{words.length} kelime</Text>
      </View>

      {words.length === 0 ? (
        <EmptyState
          icon="📖"
          title="Henüz kelime yok"
          description="İlk kelimeni ekleyerek öğrenmeye başla. Yapay zeka otomatik örnek cümle oluşturacak."
          actionLabel="+ Kelime Ekle"
          onAction={() => router.push('/add-word')}
        />
      ) : (
        <FlatList
          data={words}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WordCard word={item} onDelete={deleteWord} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-word')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  subGreeting: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: AppColors.border,
    borderRadius: 20,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: AppColors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  reviewCard: {
    backgroundColor: AppColors.primary,
  },
  statNum: {
    fontSize: 32,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  reviewArrow: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  listCount: {
    fontSize: 13,
    color: AppColors.textMuted,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
});
