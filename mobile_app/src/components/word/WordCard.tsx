import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TTSButton } from '../flashcard/TTSButton';
import type { Word } from '../../types/word';

const LEVEL_COLORS = ['#EF4444', '#F97316', '#EAB308', '#84CC16', '#22C55E', '#10B981'];
const LEVEL_LABELS = ['Yeni', 'Başlangıç', 'Öğreniliyor', 'İyi', 'Çok İyi', 'Öğrenildi'];

interface Props {
  word: Word;
  onDelete?: () => void;
}

export const WordCard: React.FC<Props> = ({ word, onDelete }) => (
  <View style={styles.card}>
    <View style={styles.topRow}>
      <View style={styles.wordRow}>
        <Text style={styles.wordText}>{word.word}</Text>
        <TTSButton text={word.word} language="en-US" size={16} />
      </View>
      <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[word.learning_level] }]}>
        <Text style={styles.levelText}>{LEVEL_LABELS[word.learning_level]}</Text>
      </View>
    </View>

    <Text style={styles.meaning}>{word.meaning}</Text>

    {onDelete && (
      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.deleteText}>Sil</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  wordText: { fontSize: 18, fontWeight: '700', color: '#1E1B4B' },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
  },
  levelText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  meaning: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  deleteBtn: { alignSelf: 'flex-end', marginTop: 10 },
  deleteText: { color: '#EF4444', fontSize: 12, fontWeight: '600' },
});
