import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { TTSButton } from './TTSButton';
import type { Word } from '../../types/word';

interface Props {
  word: Word;
  revealed: boolean;
}

const CARD_WIDTH = Dimensions.get('window').width - 48;

export const FlashCard: React.FC<Props> = ({ word, revealed }) => {
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: revealed ? 1 : 0,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [revealed]);

  const frontRotate   = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate    = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const frontOpacity  = flipAnim.interpolate({ inputRange: [0.4, 0.5], outputRange: [1, 0] });
  const backOpacity   = flipAnim.interpolate({ inputRange: [0.4, 0.5], outputRange: [0, 1] });

  return (
    <View style={[styles.container, { width: CARD_WIDTH }]}>

      {/* ÖN YÜZ — Sadece kelime + telaffuz */}
      <Animated.View
        style={[
          styles.card,
          styles.front,
          { transform: [{ perspective: 1200 }, { rotateY: frontRotate }], opacity: frontOpacity },
        ]}
      >
        <Text style={styles.langLabel}>İNGİLİZCE</Text>
        <Text style={styles.wordText}>{word.word}</Text>
        <View style={styles.ttsRow}>
          <TTSButton text={word.word} language="en-US" size={20} />
          <Text style={styles.ttsHint}>Telaffuzu dinle</Text>
        </View>
      </Animated.View>

      {/* ARKA YÜZ — Anlam + örnek cümle + her ikisinin TTS'i */}
      <Animated.View
        style={[
          styles.card,
          styles.back,
          { transform: [{ perspective: 1200 }, { rotateY: backRotate }], opacity: backOpacity },
        ]}
      >
        {/* Kelime küçük tekrar göster */}
        <Text style={styles.wordSmall}>{word.word}</Text>
        <View style={styles.divider} />

        {/* Türkçe anlam */}
        <View style={styles.meaningRow}>
          <Text style={styles.langLabel}>TÜRKÇE</Text>
          <Text style={styles.meaningText}>{word.meaning}</Text>
        </View>

        {/* Örnek cümle */}
        {word.example_sentence ? (
          <View style={styles.exampleBox}>
            <View style={styles.exampleHeader}>
              <Text style={styles.exampleLabel}>Örnek cümle</Text>
              <TTSButton text={word.example_sentence} language="en-US" size={16} />
            </View>
            <Text style={styles.exampleSentence}>"{word.example_sentence}"</Text>
            {word.example_sentence_translation ? (
              <Text style={styles.exampleTranslation}>{word.example_sentence_translation}</Text>
            ) : null}
          </View>
        ) : null}

        {/* Kelime TTS sol alt */}
        <View style={styles.wordTtsWrap}>
          <TTSButton text={word.word} language="en-US" size={16} />
        </View>
      </Animated.View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 360,
    alignSelf: 'center',
  },
  card: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    backfaceVisibility: 'hidden',
  },
  front: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  back: {
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    gap: 10,
  },

  langLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A5B4FC',
    letterSpacing: 2,
  },
  wordText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1E1B4B',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  ttsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ttsHint: {
    fontSize: 12,
    color: '#A5B4FC',
    fontWeight: '500',
  },

  wordSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E7FF',
    marginVertical: 4,
  },
  meaningRow: {
    gap: 2,
  },
  meaningText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1E1B4B',
  },

  exampleBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 12,
    gap: 4,
    marginTop: 4,
  },
  exampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exampleLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#818CF8',
    letterSpacing: 1.5,
  },
  exampleSentence: {
    fontSize: 13,
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 19,
  },
  exampleTranslation: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },

  wordTtsWrap: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});
