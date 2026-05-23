import { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { TTSButton } from './TTSButton';
import { AppColors } from '@/src/constants/colors';
import type { Word } from '@/src/context/WordContext';

interface Props {
  word: Word;
  revealed: boolean;
  onFlip?: () => void;
  onKnew?: () => void;
  onDidNotKnow?: () => void;
}

const BASE_HEIGHT = 280;
const BUTTON_EXTRA = 76; // divider + btn row height

export function FlashCard({ word, revealed, onFlip, onKnew, onDidNotKnow }: Props) {
  const hasButtons = !!(onKnew || onDidNotKnow);
  const cardHeight = hasButtons ? BASE_HEIGHT + BUTTON_EXTRA : BASE_HEIGHT;

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
    <View style={[styles.container, { height: cardHeight }]}>

      {/* ── FRONT ── */}
      <Animated.View
        style={[
          styles.card,
          { height: cardHeight },
          { transform: [{ perspective: 1200 }, { rotateY: frontRotate }] },
        ]}
      >
        {/* Tap area → flip (does NOT contain TTS or action buttons) */}
        <TouchableOpacity
          style={styles.flipZone}
          onPress={onFlip}
          activeOpacity={onFlip ? 0.9 : 1}
          disabled={!onFlip}
        >
          <Text style={styles.langTag}>{word.language.toUpperCase()}</Text>
          <Text style={styles.wordText}>{word.word}</Text>
          {onFlip && (
            <Text style={styles.flipHint}>Türkçeyi görmek için dokun</Text>
          )}
        </TouchableOpacity>

        {/* TTS — alt-orta, flip zone dışında */}
        <View style={styles.ttsCenter}>
          <TTSButton text={word.word} language={word.language} size={22} />
        </View>

        {/* Biliyorum / Bilmiyorum — kart içinde, en altta */}
        {hasButtons && (
          <>
            <View style={styles.innerDivider} />
            <View style={styles.frontBtnRow}>
              <TouchableOpacity
                style={[styles.frontBtn, styles.noBtn]}
                onPress={onDidNotKnow}
                activeOpacity={0.85}
              >
                <Text style={styles.noBtnText}>❌  Bilmiyorum</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.frontBtn, styles.yesBtn]}
                onPress={onKnew}
                activeOpacity={0.85}
              >
                <Text style={styles.yesBtnText}>✅  Biliyorum</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>

      {/* ── BACK ── */}
      <Animated.View
        style={[
          styles.card,
          styles.back,
          { height: cardHeight },
          { transform: [{ perspective: 1200 }, { rotateY: backRotate }] },
        ]}
      >
        {/* Tap to flip back */}
        <TouchableOpacity
          style={styles.backContent}
          onPress={onFlip}
          activeOpacity={onFlip ? 0.9 : 1}
          disabled={!onFlip}
        >
          <Text style={styles.wordSmall}>{word.word}</Text>
          <View style={styles.divider} />
          <Text style={styles.meaningText}>{word.meaning}</Text>
          {onFlip && <Text style={styles.backFlipHint}>İngilizceye dönmek için dokun</Text>}
        </TouchableOpacity>

        <View style={styles.backTTSRow}>
          <TTSButton text={word.word} language={word.language} size={22} />
        </View>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    position: 'absolute',
    width: '100%',
    backgroundColor: AppColors.surface,
    borderRadius: 24,
    backfaceVisibility: 'hidden',
    shadowColor: AppColors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },

  // ── Front ──────────────────────────────────────────────────────────────────
  flipZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 24,
    gap: 10,
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
  flipHint: {
    fontSize: 12,
    color: AppColors.textMuted,
    textAlign: 'center',
  },
  ttsCenter: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  innerDivider: {
    height: 1,
    backgroundColor: AppColors.border,
    marginHorizontal: 0,
  },
  frontBtnRow: {
    flexDirection: 'row',
    gap: 0,
  },
  frontBtn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noBtn: {
    borderRightWidth: 0.5,
    borderRightColor: AppColors.border,
  },
  yesBtn: {},
  noBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  yesBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },

  // ── Back ───────────────────────────────────────────────────────────────────
  back: {
    justifyContent: 'center',
  },
  backContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 24,
    gap: 14,
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
    fontSize: 28,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  backFlipHint: {
    fontSize: 12,
    color: AppColors.textMuted,
  },
  backTTSRow: {
    alignSelf: 'flex-end',
    padding: 16,
  },
});
