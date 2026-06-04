import { memo, useMemo, useState, useCallback } from 'react';
import {
  Modal, View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, Platform, StatusBar, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createWordApi } from '@/src/api/words';
import { useAppColors, type AppColorsType } from '@/src/context/ThemeContext';
import libraryRaw from '@/src/data/lingopulse_library.json';

interface WordEntry { front_word: string; back_translation: string; }

interface Category {
  id: string;
  title: string;
  description?: string;
  emoji: string;
  is_premium: boolean;
  words: WordEntry[];
}

interface Library {
  cefr_levels: Category[];
  professions: Category[];
}

const library = libraryRaw as Library;
type Tab = 'cefr' | 'profession';

// ─── Search result row ────────────────────────────────────────────────────────
interface SearchResultProps { item: WordEntry; categoryLabel: string; isAdded: boolean; isLoading: boolean; onAdd: () => void; }

const createSearchResultStyles = (c: AppColorsType) => StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8,
    borderWidth: 1, borderColor: c.border,
  },
  rowAdded: { opacity: 0.5 },
  texts: { flex: 1, gap: 3 },
  front: { fontSize: 15, fontWeight: '700', color: c.textPrimary },
  back: { fontSize: 13, color: c.textSecondary },
  tag: { fontSize: 11, color: c.textMuted, marginTop: 2 },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  addBtnDone: { backgroundColor: c.success },
});

const SearchResultItem = memo(({ item, categoryLabel, isAdded, isLoading, onAdd }: SearchResultProps) => {
  const c = useAppColors();
  const s = useMemo(() => createSearchResultStyles(c), [c]);
  return (
    <View style={[s.row, isAdded && s.rowAdded]}>
      <View style={s.texts}>
        <Text style={s.front}>{item.front_word}</Text>
        <Text style={s.back}>{item.back_translation}</Text>
        <Text style={s.tag}>{categoryLabel}</Text>
      </View>
      <TouchableOpacity
        style={[s.addBtn, isAdded && s.addBtnDone]}
        onPress={onAdd}
        disabled={isAdded || isLoading}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.8}
      >
        {isLoading ? <ActivityIndicator size="small" color="#fff" />
          : isAdded ? <Ionicons name="checkmark" size={18} color="#fff" />
          : <Ionicons name="add" size={22} color="#fff" />}
      </TouchableOpacity>
    </View>
  );
});

// ─── Category row ─────────────────────────────────────────────────────────────
interface CategoryItemProps { cat: Category; onPress: () => void; }

const createCatStyles = (c: AppColorsType) => StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 10,
    borderWidth: 1, borderColor: c.border,
  },
  emoji: { fontSize: 24, marginRight: 12 },
  left: { flex: 1, gap: 3 },
  title: { fontSize: 15, fontWeight: '700', color: c.textPrimary },
  desc: { fontSize: 12, color: c.textMuted },
  count: { fontSize: 11, color: c.textSecondary, marginTop: 2 },
  premiumBadge: {
    backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8,
  },
  premiumText: { fontSize: 10, fontWeight: '700', color: '#D97706' },
});

const CategoryItem = memo(({ cat, onPress }: CategoryItemProps) => {
  const c = useAppColors();
  const s = useMemo(() => createCatStyles(c), [c]);
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.8}>
      <Text style={s.emoji}>{cat.emoji}</Text>
      <View style={s.left}>
        <Text style={s.title}>{cat.title}</Text>
        {cat.description ? <Text style={s.desc}>{cat.description}</Text> : null}
        <Text style={s.count}>{cat.words.length} kelime</Text>
      </View>
      {cat.is_premium && (
        <View style={s.premiumBadge}><Text style={s.premiumText}>PRO</Text></View>
      )}
      <Ionicons name="chevron-forward" size={18} color={c.textMuted} style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  );
});

// ─── Word row ─────────────────────────────────────────────────────────────────
interface WordItemProps { item: WordEntry; isAdded: boolean; isLoading: boolean; onAdd: () => void; }

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
        {isLoading ? <ActivityIndicator size="small" color="#fff" />
          : isAdded ? <Ionicons name="checkmark" size={18} color="#fff" />
          : <Ionicons name="add" size={22} color="#fff" />}
      </TouchableOpacity>
    </View>
  );
});

// ─── Main modal ───────────────────────────────────────────────────────────────
interface LibraryPickerModalProps { visible: boolean; listId: string; onClose: () => void; }

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
  tabRow: {
    flexDirection: 'row', backgroundColor: c.surface,
    borderBottomWidth: 1, borderBottomColor: c.border,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: c.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: c.textMuted },
  tabTextActive: { color: c.primary },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.border,
  },
  searchInput: {
    flex: 1, backgroundColor: c.background, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 9, fontSize: 14, color: c.textPrimary,
    borderWidth: 1, borderColor: c.border,
  },
  searchCount: { fontSize: 12, color: c.textMuted, minWidth: 40, textAlign: 'right' },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },
  emptyWrap: { paddingTop: 60, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 15, color: c.textMuted },
});

// Flatten all words from all categories for global search
const allWords: { entry: WordEntry; categoryLabel: string; categoryId: string }[] = [];
for (const cat of [...library.cefr_levels, ...library.professions]) {
  for (const word of cat.words) {
    allWords.push({ entry: word, categoryLabel: `${cat.emoji} ${cat.title}`, categoryId: cat.id });
  }
}

export function LibraryPickerModal({ visible, listId, onClose }: LibraryPickerModalProps) {
  const c = useAppColors();
  const styles = useMemo(() => createStyles(c), [c]);

  const [tab, setTab] = useState<Tab>('cefr');
  const [phase, setPhase] = useState<'categories' | 'words'>('categories');
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [loadingSet, setLoadingSet] = useState<Set<string>>(new Set());

  const handleClose = useCallback(() => {
    setPhase('categories'); setSelectedCat(null); setSearchQuery('');
    setAdded(new Set()); setLoadingSet(new Set());
    onClose();
  }, [onClose]);

  const handleBack = useCallback(() => { setPhase('categories'); setSelectedCat(null); setSearchQuery(''); }, []);

  const handleCategorySelect = useCallback((cat: Category) => {
    setSelectedCat(cat); setPhase('words');
  }, []);

  const handleAdd = useCallback(async (entry: WordEntry) => {
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

  const categories = tab === 'cefr' ? library.cefr_levels : library.professions;

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return allWords.filter(
      ({ entry }) =>
        entry.front_word.toLowerCase().includes(q) ||
        entry.back_translation.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  const renderCategory = useCallback(({ item }: { item: Category }) => (
    <CategoryItem cat={item} onPress={() => handleCategorySelect(item)} />
  ), [handleCategorySelect]);

  const renderWord = useCallback(({ item }: { item: WordEntry }) => (
    <WordItem item={item} isAdded={added.has(item.front_word)} isLoading={loadingSet.has(item.front_word)} onAdd={() => handleAdd(item)} />
  ), [added, loadingSet, handleAdd]);

  const renderSearchResult = useCallback(({ item }: { item: typeof allWords[0] }) => (
    <SearchResultItem
      item={item.entry}
      categoryLabel={item.categoryLabel}
      isAdded={added.has(item.entry.front_word)}
      isLoading={loadingSet.has(item.entry.front_word)}
      onAdd={() => handleAdd(item.entry)}
    />
  ), [added, loadingSet, handleAdd]);

  const headerTitle = phase === 'words' && selectedCat
    ? `${selectedCat.emoji} ${selectedCat.title}`
    : 'LingoPulse Kütüphanesi';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={phase === 'words' ? handleBack : handleClose}
    >
      <SafeAreaView style={styles.container}>
        {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight }} />}

        {/* Header */}
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
          <Text style={styles.headerTitle} numberOfLines={1}>{headerTitle}</Text>
          <View style={styles.headerSideBtn} />
        </View>

        {/* Search bar — sadece kategori listesinde göster */}
        {phase === 'categories' && (
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color={c.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="İngilizce veya Türkçe ara..."
              placeholderTextColor={c.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {isSearching && (
              <Text style={styles.searchCount}>{searchResults.length} sonuç</Text>
            )}
          </View>
        )}

        {/* Tabs — sadece kategori listesinde ve arama yokken göster */}
        {phase === 'categories' && !isSearching && (
          <View style={styles.tabRow}>
            <TouchableOpacity style={[styles.tab, tab === 'cefr' && styles.tabActive]} onPress={() => setTab('cefr')}>
              <Text style={[styles.tabText, tab === 'cefr' && styles.tabTextActive]}>CEFR Seviyeleri</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, tab === 'profession' && styles.tabActive]} onPress={() => setTab('profession')}>
              <Text style={[styles.tabText, tab === 'profession' && styles.tabTextActive]}>Mesleki</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* İçerik */}
        {phase === 'categories' ? (
          isSearching ? (
            searchResults.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>Sonuç bulunamadı</Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(i) => `${i.categoryId}-${i.entry.front_word}`}
                renderItem={renderSearchResult}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              />
            )
          ) : (
            <FlatList
              data={categories}
              keyExtractor={(i) => i.id}
              renderItem={renderCategory}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )
        ) : (
          <FlatList
            data={selectedCat?.words ?? []}
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
