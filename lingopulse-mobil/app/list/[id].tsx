import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useWords } from '@/src/context/WordContext';
import { WordCard } from '@/src/components/WordCard';
import { EmptyState } from '@/src/components/EmptyState';
import { AppColors } from '@/src/constants/colors';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getList, getListWords, deleteWord } = useWords();

  const list = getList(id);
  const words = getListWords(id);

  if (!list) {
    return (
      <View style={styles.container}>
        <EmptyState icon="❓" title="Liste bulunamadı" description="Bu liste silinmiş olabilir." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title} numberOfLines={1}>{list.name}</Text>
          <Text style={styles.subtitle}>{words.length} kelime</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {words.length === 0 ? (
        <EmptyState
          icon="✏️"
          title="Bu listede kelime yok"
          description="İlk kelimeni ekleyerek çalışmaya başla."
          actionLabel="+ Kelime Ekle"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onAction={() => router.push(`/add-word?listId=${id}` as any)}
        />
      ) : (
        <FlatList
          data={words}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <WordCard word={item} onDelete={deleteWord} />
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onPress={() => router.push(`/add-word?listId=${id}` as any)}
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
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 32,
    color: AppColors.primary,
    fontWeight: '300',
    lineHeight: 36,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
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
