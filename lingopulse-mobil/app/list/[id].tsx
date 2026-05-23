import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWords } from '@/src/context/WordContext';
import { WordCard } from '@/src/components/WordCard';
import { EmptyState } from '@/src/components/EmptyState';
import { OxfordPickerModal } from '@/src/components/OxfordPickerModal';
import { AppColors } from '@/src/constants/colors';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getList, getListWords, loadListWords, isLoadingWords, deleteWord } = useWords();
  const [oxfordVisible, setOxfordVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (id) loadListWords(id);
    }, [id, loadListWords]),
  );

  const list = getList(id ?? '');
  const words = getListWords(id ?? '');

  if (!list && !isLoadingWords) {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={AppColors.textPrimary} />
          </TouchableOpacity>
        </View>
        <EmptyState icon="❓" title="Liste bulunamadı" description="Bu liste silinmiş olabilir." />
      </View>
    );
  }

  const ListHeader = (
    <View style={styles.listHeader}>
      {/* Aksiyon butonları */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionChip}
          onPress={() => setOxfordVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.actionChipIcon}>⚡</Text>
          <Text style={styles.actionChipText}>Oxford'dan Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* Çalışmaya Başla CTA */}
      {words.length > 0 && (
        <TouchableOpacity
          style={styles.studyBtn}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onPress={() => router.push(`/study/${id}` as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.studyBtnIcon}>▶️</Text>
          <Text style={styles.studyBtnText}>Çalışmaya Başla</Text>
          <Text style={styles.studyBtnCount}>{words.length} kelime</Text>
        </TouchableOpacity>
      )}

      {/* Kelimeler başlığı */}
      {words.length > 0 && (
        <Text style={styles.sectionLabel}>Kelimeler</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ── Üst bar ───────────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={AppColors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.titleArea}>
          <Text style={styles.listName} numberOfLines={1}>{list?.name ?? '…'}</Text>
          <Text style={styles.wordCount}>{words.length} Kelime</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* ── İçerik ────────────────────────────────────────────────────────── */}
      {isLoadingWords && words.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={AppColors.primary} />
        </View>
      ) : (
        <FlatList
          data={words}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="✏️"
              title="Bu listede kelime yok"
              description="Manuel ekle ya da Oxford havuzundan hızlıca seç."
              actionLabel="⚡ Oxford'dan Seç"
              onAction={() => setOxfordVisible(true)}
            />
          }
          renderItem={({ item }) => (
            <WordCard word={item} onDelete={deleteWord} />
          )}
        />
      )}

      {/* ── FAB ───────────────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.fab}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onPress={() => router.push(`/add-word?listId=${id}` as any)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* ── Oxford modal ──────────────────────────────────────────────────── */}
      <OxfordPickerModal
        visible={oxfordVisible}
        listId={id ?? ''}
        onClose={() => {
          setOxfordVisible(false);
          if (id) loadListWords(id);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingTop: 56,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Top bar ────────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleArea: {
    flex: 1,
    alignItems: 'center',
  },
  listName: {
    fontSize: 22,
    fontWeight: '800',
    color: AppColors.textPrimary,
    letterSpacing: -0.3,
  },
  wordCount: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },

  // ── List header (actions + CTA + section label) ────────────────────────────
  listHeader: {
    gap: 12,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    paddingVertical: 11,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    shadowColor: AppColors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  actionChipIcon: {
    fontSize: 16,
  },
  actionChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },

  studyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  studyBtnIcon: {
    fontSize: 18,
  },
  studyBtnText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  studyBtnCount: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 4,
  },

  // ── FlatList ───────────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  // ── FAB ───────────────────────────────────────────────────────────────────
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
});
