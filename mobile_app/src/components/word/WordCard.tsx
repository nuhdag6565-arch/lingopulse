import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';
import type { Word } from '../../types/word';

const LEVEL_COLORS = ['#EF4444', '#F97316', '#EAB308', '#84CC16', '#22C55E', '#10B981'];

interface Props {
  word: Word;
  onPress?: () => void;
  onDelete?: () => void;
}

export const WordCard: React.FC<Props> = ({ word, onPress, onDelete }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.word}>{word.word}</Text>
        <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[word.learning_level] }]}>
          <Text style={styles.levelText}>L{word.learning_level}</Text>
        </View>
      </View>
      <Text style={styles.meaning} numberOfLines={2}>{word.meaning}</Text>
      {onDelete && (
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Text style={styles.deleteText}>Sil</Text>
        </TouchableOpacity>
      )}
    </Card>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  word: { fontSize: 18, fontWeight: '700', color: '#1E1B4B' },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  levelText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  meaning: { fontSize: 14, color: '#6B7280' },
  deleteBtn: { alignSelf: 'flex-end', marginTop: 8 },
  deleteText: { color: '#EF4444', fontSize: 12 },
});
