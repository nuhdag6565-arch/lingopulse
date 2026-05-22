import { memo, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createWordApi } from '@/src/api/words';
import { AppColors } from '@/src/constants/colors';
import oxfordRaw from '@/src/data/oxford_full.json';

interface OxfordEntry {
  front_word: string;
  back_translation: string;
}

const oxfordData = oxfordRaw as Record<string, OxfordEntry[]>;
const CATEGORIES = Object.keys(oxfordData);

// ─── Category row (Phase 1) ────────────────────────────────────────────────

interface CategoryItemProps {
  name: string;
  wordCount: number;
  onPress: () => void;
}

const CategoryItem = memo(({ name, wordCount, onPress }: CategoryItemProps) => (
  <TouchableOpacity style={styles.categoryCard} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.categoryLeft}>
      <Text style={styles.categoryName}>{name}</Text>
      <Text style={styles.categoryCount}>{wordCount} kelime</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={AppColors.textMuted} />
  </TouchableOpacity>
));

// ─── Word row (Phase 2) ────────────────────────────────────────────────────

interface WordItemProps {
  item: OxfordEntry;
  isAdded: boolean;
  isLoading: boolean;
  onAdd: () => void;
}

const WordItem = memo(({ item, isAdded, isLoading, onAdd }: WordItemProps) => (
  <View style={[styles.wordRow, isAdded && styles.wordRowAdded]}>
    <View style={styles.wordTexts}>
      <Text style={[styles.wordFront, isAdded && styles.wordFrontAdded]}>
        {item.front_word}
      </Text>
      <Text style={[styles.wordBack, isAdded && styles.wordBackAdded]}>
        {item.back_translation}
      </Text>
    </View>
    <TouchableOpacity
      style={[styles.addBtn, isAdded && styles.addBtnDone]}
      onPress={onAdd}
      disabled={isAdded || isLoading}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : isAdded ? (
        <Ionicons name="checkmark" size={18} color="#fff" />
      ) : (
        <Ionicons name="add" size={22} color="#fff" />
      )}
    </TouchableOpacity>
  </View>
));

// ─── Main modal ────────────────────────────────────────────────────────────

interface OxfordPickerModalProps {
  visible: boolean;
  listId: string;
  onClose: () => void;
}

export function OxfordPickerModal({ visible, listId, onClose }: OxfordPickerModalProps) {
  const [phase, setPhase] = useState<'categories' | 'words'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [loadingSet, setLoadingSet] = useState<Set<string>>(new Set());

  const words = selectedCategory ? oxfordData[selectedCategory] ?? [] : [];

  const handleClose = useCallback(() => {
    setPhase('categories');
    setSelectedCategory(null);
    setAdded(new Set());
    setLoadingSet(new Set());
    onClose();
  }, [onClose]);

  const handleBack = useCallback(() => {
    setPhase('categories');
    setSelectedCategory(null);
  }, []);

  const handleCategorySelect = useCallback((name: string) => {
    setSelectedCategory(name);
    setPhase('words');
  }, []);

  const handleAdd = useCallback(
    async (entry: OxfordEntry) => {
      const key = entry.front_word;
      if (added.has(key)) return;

      setLoadingSet((prev) => new Set(prev).add(key));
      try {
        await createWordApi(entry.front_word, entry.back_translation, listId);
        setAdded((prev) => new Set(prev).add(key));
      } catch {
        // hata sessizce yutulur; kullanıcı tekrar deneyebilir
      } finally {
        setLoadingSet((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [added, listId],
  );

  const renderCategory = useCallback(
    ({ item }: { item: string }) => (
      <CategoryItem
        name={item}
        wordCount={oxfordData[item]?.length ?? 0}
        onPress={() => handleCategorySelect(item)}
      />
    ),
    [handleCategorySelect],
  );

  const renderWord = useCallback(
    ({ item }: { item: OxfordEntry }) => (
      <WordItem
        item={item}
        isAdded={added.has(item.front_word)}
        isLoading={loadingSet.has(item.front_word)}
        onAdd={() => handleAdd(item)}
      />
    ),
    [added, loadingSet, handleAdd],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={phase === 'words' ? handleBack : handleClose}
    >
      <SafeAreaView style={styles.container}>
        {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight }} />}

        {/* Başlık çubuğu */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerSideBtn}
            onPress={phase === 'words' ? handleBack : handleClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {phase === 'words' ? (
              <View style={styles.backRow}>
                <Ionicons name="arrow-back" size={20} color={AppColors.primary} />
                <Text style={styles.backText}>Geri</Text>
              </View>
            ) : (
              <Ionicons name="close" size={24} color={AppColors.textSecondary} />
            )}
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {phase === 'categories' ? 'Oxford Havuzu' : selectedCategory}
          </Text>

          <View style={styles.headerSideBtn} />
        </View>

        {phase === 'categories' ? (
          <FlatList
            data={CATEGORIES}
            keyExtractor={(item) => item}
            renderItem={renderCategory}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={words}
            keyExtractor={(item) => item.front_word}
            renderItem={renderWord}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={Platform.OS === 'android'}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ─── Stiller ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    backgroundColor: AppColors.surface,
  },
  headerSideBtn: {
    width: 64,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.primary,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },

  // Kategori kartı
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryLeft: {
    flex: 1,
    gap: 3,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  categoryCount: {
    fontSize: 12,
    color: AppColors.textMuted,
  },

  // Kelime satırı
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  wordRowAdded: {
    opacity: 0.5,
  },
  wordTexts: {
    flex: 1,
    gap: 3,
  },
  wordFront: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  wordFrontAdded: {
    color: AppColors.textSecondary,
  },
  wordBack: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  wordBackAdded: {
    color: AppColors.textMuted,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDone: {
    backgroundColor: AppColors.success,
  },
});
