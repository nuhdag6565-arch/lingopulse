import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { FlashCard } from '../components/flashcard/FlashCard';
import { ReviewButtons } from '../components/flashcard/ReviewButtons';
import { Loading } from '../components/common/Loading';
import { useReview } from '../hooks/useReview';
import type { Word } from '../types/word';

export const FlashCardScreen: React.FC = () => {
  const { dueWords, loading, review } = useReview();
  const [queue, setQueue]     = useState<Word[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Ekrana her girişte kuyruğu dueWords'ten kur
  useEffect(() => {
    if (dueWords.length > 0 && queue.length === 0) {
      setQueue([...dueWords]);
    }
  }, [dueWords]);

  if (loading && queue.length === 0) return <Loading />;

  if (queue.length === 0) {
    return (
      <View style={styles.done}>
        <Text style={styles.doneEmoji}>🎉</Text>
        <Text style={styles.doneTitle}>Harika!</Text>
        <Text style={styles.doneBody}>Bugünlük tüm tekrarları tamamladın.</Text>
      </View>
    );
  }

  const current   = queue[0];
  const remaining = queue.length;

  const animateOut = (cb: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start(() => {
      cb();
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const advance = (nextQueue: Word[]) => {
    animateOut(() => {
      setQueue(nextQueue);
      setRevealed(false);
      setSubmitting(false);
    });
  };

  // Biliyorum — anlam göstermeden geç
  const handleKnew = async () => {
    setSubmitting(true);
    await review(current.id, true);
    advance(queue.slice(1));
  };

  // Bilmiyorum — kartı çevir, API çağrısını yap, "Devam Et" bekle
  const handleDidNotKnow = async () => {
    setSubmitting(true);
    setRevealed(true);
    await review(current.id, false);
    setSubmitting(false);
  };

  // Devam Et — bir sonraki karta geç
  const handleContinue = () => {
    advance(queue.slice(1));
  };

  return (
    <View style={styles.screen}>
      {/* Sayaç */}
      <View style={styles.header}>
        <Text style={styles.counter}>{remaining} kelime kaldı</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((dueWords.length - remaining) / dueWords.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Kart */}
      <Animated.View style={[styles.cardArea, { opacity: fadeAnim }]}>
        {/* key={current.id} → her yeni kart fresh mount, flip animasyonu sıfırlanır */}
        <FlashCard key={current.id} word={current} revealed={revealed} />
      </Animated.View>

      {/* Hint (sadece ön yüzde) */}
      {!revealed && (
        <Text style={styles.hint}>Kelimeyi biliyor musun?</Text>
      )}
      {revealed && (
        <Text style={styles.hint}>Kelime aklında kalsın 👆</Text>
      )}

      {/* Butonlar */}
      <View style={styles.buttons}>
        <ReviewButtons
          revealed={revealed}
          loading={submitting}
          onKnew={handleKnew}
          onDidNotKnow={handleDidNotKnow}
          onContinue={handleContinue}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F3FF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 8,
  },
  counter: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E7FF',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 2,
  },
  cardArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  hint: {
    textAlign: 'center',
    fontSize: 13,
    color: '#C4B5FD',
    fontWeight: '500',
    marginBottom: 16,
  },
  buttons: {
    paddingBottom: 40,
  },
  done: {
    flex: 1,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 32,
  },
  doneEmoji: { fontSize: 72 },
  doneTitle: { fontSize: 28, fontWeight: '800', color: '#1E1B4B' },
  doneBody:  { fontSize: 16, color: '#6B7280', textAlign: 'center' },
});
