import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { TTSButton } from './TTSButton';
import type { Word } from '../../types/word';

interface Props {
  word: Word;
  revealed: boolean;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

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

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0.4, 0.5], outputRange: [1, 0] });
  const backOpacity  = flipAnim.interpolate({ inputRange: [0.4, 0.5], outputRange: [0, 1] });

  return (
    <View style={[styles.container, { width: CARD_WIDTH }]}>
      {/* ÖN YÜZ — Kelime */}
      <Animated.View
        style={[
          styles.card,
          styles.front,
          { transform: [{ perspective: 1200 }, { rotateY: frontRotate }], opacity: frontOpacity },
        ]}
      >
        <Text style={styles.langTag}>EN</Text>
        <Text style={styles.wordText}>{word.word}</Text>
        <View style={styles.ttsWrap}>
          <TTSButton text={word.word} language="en-US" size={20} />
        </View>
      </Animated.View>

      {/* ARKA YÜZ — Anlam */}
      <Animated.View
        style={[
          styles.card,
          styles.back,
          { transform: [{ perspective: 1200 }, { rotateY: backRotate }], opacity: backOpacity },
        ]}
      >
        <Text style={styles.langTag}>TR</Text>
        <Text style={styles.wordSmall}>{word.word}</Text>
        <View style={styles.divider} />
        <Text style={styles.meaningText}>{word.meaning}</Text>
        <View style={styles.ttsWrap}>
          <TTSButton text={word.word} language="en-US" size={20} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 320,
    alignSelf: 'center',
  },
  card: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    backfaceVisibility: 'hidden',
  },
  front: {},
  back: { backgroundColor: '#F5F3FF' },
  langTag: {
    position: 'absolute',
    top: 16,
    left: 20,
    fontSize: 11,
    fontWeight: '700',
    color: '#A5B4FC',
    letterSpacing: 1.5,
  },
  wordText: {
    fontSize: 38,
    fontWeight: '800',
    color: '#1E1B4B',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  wordSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 4,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: '#E0E7FF',
    borderRadius: 1,
    marginVertical: 12,
  },
  meaningText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E1B4B',
    textAlign: 'center',
  },
  ttsWrap: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});
