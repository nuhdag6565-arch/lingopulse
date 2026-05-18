import { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { TTSButton } from './TTSButton';
import { AppColors } from '@/src/constants/colors';
import type { Word } from '@/src/context/WordContext';

interface Props {
  word: Word;
  revealed: boolean;
}

export function FlashCard({ word, revealed }: Props) {
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: revealed ? 180 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  }, [revealed, flipAnim]);

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* FRONT */}
      <Animated.View
        style={[
          styles.card,
          styles.front,
          { transform: [{ perspective: 1200 }, { rotateY: frontRotate }] },
        ]}
      >
        <Text style={styles.langTag}>{word.language.toUpperCase()}</Text>
        <Text style={styles.wordText}>{word.word}</Text>
        <View style={styles.ttsRow}>
          <TTSButton text={word.word} language={word.language} size={20} />
          <Text style={styles.ttsHint}>seslendirmek için dokun</Text>
        </View>
        <Text style={styles.flipHint}>«  Anlamını görmek için Bilmiyorum'a bas  »</Text>
      </Animated.View>

      {/* BACK */}
      <Animated.View
        style={[
          styles.card,
          styles.back,
          { transform: [{ perspective: 1200 }, { rotateY: backRotate }] },
        ]}
      >
        <Text style={styles.wordSmall}>{word.word}</Text>
        <View style={styles.divider} />
        <Text style={styles.meaningText}>{word.meaning}</Text>
        <View style={styles.exampleBox}>
          <View style={styles.exampleHeader}>
            <Text style={styles.exampleLabel}>Örnek Cümle</Text>
            <TTSButton text={word.exampleSentence} language={word.language} size={18} />
          </View>
          <Text style={styles.exampleText}>{word.exampleSentence}</Text>
        </View>
        <View style={styles.wordTTSRow}>
          <TTSButton text={word.word} language={word.language} size={20} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 340,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: AppColors.surface,
    borderRadius: 24,
    padding: 28,
    backfaceVisibility: 'hidden',
    shadowColor: AppColors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  front: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  back: {
    justifyContent: 'center',
    gap: 12,
  },
  langTag: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.primary,
    letterSpacing: 1.5,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  wordText: {
    fontSize: 36,
    fontWeight: '800',
    color: AppColors.textPrimary,
    textAlign: 'center',
  },
  ttsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ttsHint: {
    fontSize: 12,
    color: AppColors.textMuted,
  },
  flipHint: {
    fontSize: 12,
    color: AppColors.textMuted,
    textAlign: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  wordSmall: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.border,
  },
  meaningText: {
    fontSize: 26,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  exampleBox: {
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  exampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exampleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.primary,
    letterSpacing: 1,
  },
  exampleText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  wordTTSRow: {
    alignSelf: 'flex-end',
  },
});
