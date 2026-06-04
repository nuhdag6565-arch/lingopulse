import { memo, useMemo, useState, useCallback } from 'react';
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
import { useAppColors, type AppColorsType } from '@/src/context/ThemeContext';
import oxfordRaw from '@/src/data/oxford_full.json';

interface OxfordEntry { front_word: string; back_translation: string; }

const oxfordData = oxfordRaw as Record<string, OxfordEntry[]>;
const CATEGORIES = Object.keys(oxfordData);

// ─── Category row ─────────────────────────────────────────────────────────────
interface CategoryItemProps { name: string; wordCount: number; onPress: () => void; }

const createCategoryStyles = (c: AppColorsType) => StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface,
    borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16, marginBottom: 10,
    borderWidth: 1, borderColor: c.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  left: { flex: 1, gap: 3 },
  name: { fontSize: 15, fontWeight: '700', color: c.textPrimary },
  count: { fontSize: 12, color: c.textMuted },
});

const CategoryItem = memo(({ name, wordCount, onPress }: CategoryItemProps) => {
  const c = useAppColors();
  const s = useMemo(() => createCategoryStyles(c), [c]);
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.8}>
      <View style={s.left}>
        <Text style={s.name}>{name}</Text>
        <Text style={s.count}>{wordCount} kelime</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={c.textMuted} />
    </TouchableOpacity>
  );
});

// ─── Word row ─────────────────────────────────────────────────────────────────
interface WordItemProps { item: OxfordEntry; isAdded: boolean; isLoading: boolean; onAdd: () => void; }

const createWordStyles = (c: AppColorsType) => StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8,
    borderWidth: 1, borderColor: c.border,
  },
  rowAdded: { opacity: 0.5 },
  texts: { flex: 1, gap: 3 },
  front: { fontSize: 15, fontWeight: '700', color: c.textPrimary },
  frontAdded: { color: c.textSecondary },
  back: { fontSize: 13, color: c.textSecondary },
  backAdded: { color: c.textMuted },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  addBtnDone: { backgroundColor: c.success },
});

const WordItem = memo(({ item, isAdded, isLoading, onAdd }: WordItemProps) => {
  const c = useAppColors();
  const s = useMemo(() => createWordStyles(c), [c]);
  return (
    <View style={[s.row, isAdded && s.rowAdded]}>
      <View style={s.texts}>
        <Text style={[s.front, isAdded && s.frontAdded]}>{item.front_word}</Text>
        <Text style={[s.back, isAdded && s.backAdded]}>{item.back_translation}</Text>
      </View>
      <TouchableOpacity
        style={[s.addBtn, isAdded && s.addBtnDone]}
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
  );
});

// ─── Main modal ───────────────────────────────────────────────────────────────
interface OxfordPickerModalProps { visible: boolean; listId: string; onClose: () => void; }

const createStyles = (c: AppColorsType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: c.surface,
  },
  headerSideBtn: { width: 64 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: 15, fontWeight: '600', color: c.primary },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: c.textPrimary },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },
});

export function OxfordPickerModal({ visible, listId, onClose }: OxfordPickerModalProps) {
  const c = useAppColors();
  const styles = useMemo(() => createStyles(c), [c]);

  const [phase, setPhase] = useState<'categories' | 'words'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [loadingSet, setLoadingSet] = useState<Set<string>>(new Set());

  const words = selectedCategory ? oxfordData[selectedCategory] ?? [] : [];

  const handleClose = useCallback(() => {
    setPhase('categories'); setSelectedCategory(null);
    setAdded(new Set()); setLoadingSet(new Set());
    onClose();
  }, [onClose]);

  const handleBack = useCallback(() => { setPhase('categories'); setSelectedCategory(null); }, []);
  const handleCategorySelect = useCallback((name: string) => { setSelectedCategory(name); setPhase('words'); }, []);

  const handleAdd = useCallback(async (entry: OxfordEntry) => {
    const key = entry.front_word;
    if (added.has(key)) return;
    setLoadingSet((prev) => new Set(prev).add(key));
    try {
      await createWordApi(entry.front_word, entry.back_translation, listId);
      setAdded((prev) => new Set(prev).add(key));
    } catch {}
    finally {
      setLoadingSet((prev) => { const next = new Set(prev); next.delete(key); return next; });
    }
  }, [added, listId]);

  const renderCategory = useCallback(({ item }: { item: string }) => (
    <CategoryItem name={item} wordCount={oxfordData[item]?.length ?? 0} onPress={() => handleCategorySelect(item)} />
  ), [handleCategorySelect]);

  const renderWord = useCallback(({ item }: { item: OxfordEntry }) => (
    <WordItem item={item} isAdded={added.has(item.front_word)} isLoading={loadingSet.has(item.front_word)} onAdd={() => handleAdd(item)} />
  ), [added, loadingSet, handleAdd]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={phase === 'words' ? handleBack : handleClose}
    >
      <SafeAreaView style={styles.container}>
        {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight }} />}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerSideBtn} onPress={phase === 'words' ? handleBack : handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            {phase === 'words' ? (
              <View style={styles.backRow}>
                <Ionicons name="arrow-back" size={20} color={c.primary} />
                <Text style={styles.backText}>Geri</Text>
              </View>
            ) : (
              <Ionicons name="close" size={24} color={c.textSecondary} />
            )}
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {phase === 'categories' ? 'Oxford Havuzu' : selectedCategory}
          </Text>
          <View style={styles.headerSideBtn} />
        </View>

        {phase === 'categories' ? (
          <FlatList data={CATEGORIES} keyExtractor={(i) => i} renderItem={renderCategory} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} />
        ) : (
          <FlatList
            data={words}
            keyExtractor={(i) => i.front_word}
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
