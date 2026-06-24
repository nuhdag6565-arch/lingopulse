import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWords } from '@/src/context/WordContext';
import { useTTS } from '@/src/context/TTSContext';
import { useAuth } from '@/src/context/AuthContext';
import { WordCard } from '@/src/components/WordCard';
import { EmptyState } from '@/src/components/EmptyState';
import { LibraryPickerModal } from '@/src/components/LibraryPickerModal';
import { useAppColors, type AppColorsType } from '@/src/context/ThemeContext';

const SPEED_OPTIONS = ['0.25', '0.5', '0.75', '1.0', '1.25', '1.5', '1.75', '2.0'];

const createStyles = (c: AppColorsType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background, paddingTop: 56 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  titleArea: { flex: 1, alignItems: 'center' },
  listName: { fontSize: 22, fontWeight: '800', color: c.textPrimary, letterSpacing: -0.3 },
  wordCount: { fontSize: 13, color: c.textSecondary, fontWeight: '500', marginTop: 2 },
  listHeader: { gap: 12, marginBottom: 8 },
  libraryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: c.surface, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 10,
    borderWidth: 1, borderColor: c.border,
  },
  libraryBtnText: { fontSize: 12, fontWeight: '700', color: c.primary },
speedToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: c.surface, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12,
    borderWidth: 1.5, borderColor: c.border,
  },
  speedToggleText: { fontSize: 13, fontWeight: '700', color: c.textSecondary },
  speedChipsRow: { marginTop: 8 },
  speedChips: { flexDirection: 'row', gap: 6 },
  speedChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border,
  },
  speedChipActive: { backgroundColor: '#EEF2FF', borderColor: c.primary },
  speedChipText: { fontSize: 12, fontWeight: '700', color: c.textSecondary },
  speedChipTextActive: { color: c.primary },
  sectionLabel: {
    fontSize: 13, fontWeight: '700', color: c.textMuted,
    letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 4,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  fab: {
    position: 'absolute', bottom: 32, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: c.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
});

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getList, getListWords, loadListWords, isLoadingWords, deleteWord } = useWords();
  const { ttsSpeedValue, setTtsSpeed } = useTTS();
  const { updatePreferences } = useAuth();
  const c = useAppColors();
  const styles = useMemo(() => createStyles(c), [c]);
  const [oxfordVisible, setOxfordVisible] = useState(false);
  const [showSpeed,     setShowSpeed]     = useState(false);

  const handleSpeed = useCallback(async (val: string) => {
    setTtsSpeed(val);
    try {
      await updatePreferences({ ttsSpeed: parseFloat(val) });
    } catch (e: any) {
      Alert.alert('Hata', e?.response?.data?.detail ?? e?.message ?? 'Ayar kaydedilemedi.');
    }
  }, [setTtsSpeed, updatePreferences]);

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
            <Ionicons name="arrow-back" size={22} color={c.textPrimary} />
          </TouchableOpacity>
        </View>
        <EmptyState icon="❓" title="Liste bulunamadı" description="Bu liste silinmiş olabilir." />
      </View>
    );
  }

  const ListHeader = (
    <View style={styles.listHeader}>
      {/* Ses hızı — kapalı/açık toggle */}
      <TouchableOpacity
        style={styles.speedToggle}
        onPress={() => setShowSpeed(v => !v)}
        activeOpacity={0.8}
      >
        <Ionicons name="speedometer-outline" size={15} color={c.textSecondary} />
        <Text style={styles.speedToggleText}>Ses Hızı  {ttsSpeedValue}×</Text>
        <Ionicons name={showSpeed ? 'chevron-up' : 'chevron-down'} size={14} color={c.textSecondary} />
      </TouchableOpacity>

      {showSpeed && (
        <View style={styles.speedChipsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.speedChips}>
            {SPEED_OPTIONS.map((val) => {
              const active = ttsSpeedValue === val;
              return (
                <TouchableOpacity
                  key={val}
                  style={[styles.speedChip, active && styles.speedChipActive]}
                  onPress={() => { handleSpeed(val); setShowSpeed(false); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.speedChipText, active && styles.speedChipTextActive]}>{val}×</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {words.length > 0 && <Text style={styles.sectionLabel}>Kelimeler</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={c.textPrimary} />
        </TouchableOpacity>
        <View style={styles.titleArea}>
          <Text style={styles.listName} numberOfLines={1}>{list?.name ?? '…'}</Text>
          <Text style={styles.wordCount}>{words.length} Kelime</Text>
        </View>
        <TouchableOpacity style={styles.libraryBtn} onPress={() => setOxfordVisible(true)} activeOpacity={0.8}>
          <Ionicons name="flash" size={13} color={c.primary} />
          <Text style={styles.libraryBtnText}>Kütüphane</Text>
        </TouchableOpacity>
      </View>

      {isLoadingWords && words.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.primary} />
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
              description="Manuel ekle ya da kütüphaneden hızlıca seç."
              actionLabel="⚡ Kütüphaneden Seç"
              onAction={() => setOxfordVisible(true)}
            />
          }
          renderItem={({ item }) => <WordCard word={item} onDelete={deleteWord} />}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(`/add-word?listId=${id}` as any)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <LibraryPickerModal
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
