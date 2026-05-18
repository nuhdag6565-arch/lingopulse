import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { TTSButton } from './TTSButton';
import { AppColors } from '@/src/constants/colors';
import type { Word } from '@/src/context/WordContext';

interface Props {
  word: Word;
  onDelete: (id: string) => void;
}

const LEVEL_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#6366F1'];
const LEVEL_LABELS = ['Yeni', 'Öğreniliyor', 'Az Biliniyor', 'Biliniyor', 'İyi Biliniyor', 'Ustalaşıldı'];

export function WordCard({ word, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);

  const confirmDelete = () => {
    Alert.alert('Kelimeyi Sil', `"${word.word}" silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => onDelete(word.id) },
    ]);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setExpanded((e) => !e)}
      activeOpacity={0.9}
    >
      <View style={styles.top}>
        <View style={styles.left}>
          <Text style={styles.word}>{word.word}</Text>
          <Text style={styles.meaning} numberOfLines={expanded ? undefined : 1}>
            {word.meaning}
          </Text>
        </View>
        <View style={styles.right}>
          <TTSButton text={word.word} language={word.language} size={18} />
          <TouchableOpacity onPress={confirmDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteIcon}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>

      {expanded && (
        <View style={styles.expanded}>
          <View style={styles.divider} />
          <View style={styles.exampleRow}>
            <Text style={styles.exampleText} numberOfLines={3}>
              {word.exampleSentence}
            </Text>
            <TTSButton text={word.exampleSentence} language={word.language} size={16} />
          </View>
          <View style={styles.levelRow}>
            <View style={[styles.levelDot, { backgroundColor: LEVEL_COLORS[word.learningLevel] }]} />
            <Text style={[styles.levelLabel, { color: LEVEL_COLORS[word.learningLevel] }]}>
              {LEVEL_LABELS[word.learningLevel]}
            </Text>
            <Text style={styles.reviewDate}>· Tekrar: {word.nextReviewDate}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: AppColors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  left: {
    flex: 1,
    gap: 3,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  word: {
    fontSize: 17,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  meaning: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 16,
  },
  expanded: {
    gap: 10,
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.border,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  exampleText: {
    flex: 1,
    fontSize: 13,
    color: AppColors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 12,
    color: AppColors.textMuted,
  },
});
