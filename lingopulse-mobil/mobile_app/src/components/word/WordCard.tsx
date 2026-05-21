import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TTSButton } from '../flashcard/TTSButton';
import type { Word } from '../../types/word';

const LEVEL_COLORS  = ['#EF4444', '#F97316', '#EAB308', '#84CC16', '#22C55E', '#10B981'];
const LEVEL_LABELS  = ['Yeni', 'Başlangıç', 'Öğreniliyor', 'İyi', 'Çok İyi', 'Öğrenildi'];

interface Props {
  word: Word;
  onDelete?: () => void;
}

export const WordCard: React.FC<Props> = ({ word, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.95}
      onPress={() => setExpanded((v) => !v)}
    >
      {/* Üst satır: kelime + TTS + seviye */}
      <View style={styles.topRow}>
        <View style={styles.wordRow}>
          <Text style={styles.wordText}>{word.word}</Text>
          <TTSButton text={word.word} language="en-US" size={16} />
        </View>
        <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[word.learning_level] }]}>
          <Text style={styles.levelText}>{LEVEL_LABELS[word.learning_level]}</Text>
        </View>
      </View>

      {/* Türkçe anlam */}
      <Text style={styles.meaning}>{word.meaning}</Text>

      {/* Örnek cümle — genişletince göster */}
      {expanded && word.example_sentence ? (
        <View style={styles.exampleBox}>
          <View style={styles.exampleHeader}>
            <Text style={styles.exampleLabel}>ÖRNEK CÜMLE</Text>
            <TTSButton text={word.example_sentence} language="en-US" size={14} />
          </View>
          <Text style={styles.exampleText}>"{word.example_sentence}"</Text>
          {word.example_sentence_translation ? (
            <Text style={styles.exampleTr}>{word.example_sentence_translation}</Text>
          ) : null}
        </View>
      ) : word.example_sentence ? (
        <Text style={styles.expandHint}>▸ örnek cümleyi gör</Text>
      ) : null}

      {/* Sil butonu */}
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={onDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.deleteText}>Sil</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

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
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  meaning: { fontSize: 14, color: '#374151', lineHeight: 20 },
  expandHint: { fontSize: 12, color: '#A5B4FC', fontWeight: '500' },
  exampleBox: {
    backgroundColor: '#F5F3FF',
    borderRadius: 10,
    padding: 10,
    gap: 4,
    marginTop: 2,
  },
  exampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exampleLabel: { fontSize: 9, fontWeight: '700', color: '#818CF8', letterSpacing: 1.5 },
  exampleText: { fontSize: 13, color: '#374151', fontStyle: 'italic', lineHeight: 18 },
  exampleTr: { fontSize: 12, color: '#6B7280', lineHeight: 17 },
  deleteBtn: { alignSelf: 'flex-end', marginTop: 4 },
  deleteText: { color: '#EF4444', fontSize: 12, fontWeight: '600' },
});
