import { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { TTSButton } from './TTSButton';
import { useAppColors, type AppColorsType } from '@/src/context/ThemeContext';
import type { Word } from '@/src/context/WordContext';

interface Props {
  word: Word;
  onDelete: (id: string) => void;
}

function getMasteryColor(easeFactor: number): string {
  if (easeFactor < 2.0) return '#EF4444';
  if (easeFactor < 2.5) return '#F59E0B';
  return '#10B981';
}

const createStyles = (c: AppColorsType) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 12,
    marginBottom: 8,
    shadowColor: c.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  left: { flex: 1, gap: 3, marginRight: 12 },
  english: {
    fontSize: 17,
    fontWeight: '700',
    color: c.textPrimary,
    letterSpacing: 0.1,
  },
  turkish: { fontSize: 13, fontWeight: '400', color: c.textSecondary },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  masteryDot: { width: 10, height: 10, borderRadius: 5 },
});

export function WordCard({ word, onDelete }: Props) {
  const c = useAppColors();
  const styles = useMemo(() => createStyles(c), [c]);
  const masteryColor = getMasteryColor(word.easeFactor);

  const confirmDelete = () => {
    Alert.alert('Kelimeyi Sil', `"${word.word}" silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => onDelete(word.id) },
    ]);
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.left}
        onLongPress={confirmDelete}
        activeOpacity={0.75}
        delayLongPress={500}
      >
        <Text style={styles.english} numberOfLines={1}>{word.word}</Text>
        <Text style={styles.turkish} numberOfLines={1}>{word.meaning}</Text>
      </TouchableOpacity>
      <View style={styles.right}>
        <TTSButton text={word.word} language={word.language} size={17} />
        <View style={[styles.masteryDot, { backgroundColor: masteryColor }]} />
      </View>
    </View>
  );
}
