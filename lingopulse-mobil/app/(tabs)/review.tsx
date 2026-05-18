import { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useWords, type Word } from '@/src/context/WordContext';
import { FlashCard } from '@/src/components/FlashCard';
import { ReviewButtons } from '@/src/components/ReviewButtons';
import { EmptyState } from '@/src/components/EmptyState';
import { AppColors } from '@/src/constants/colors';

export default function ReviewScreen() {
  const { getDueWords, reviewWord } = useWords();
  const [queue, setQueue] = useState<Word[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [sessionDone, setSessionDone] = useState(0);
  const [finished, setFinished] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      const due = getDueWords();
      setQueue(due);
      setSessionTotal(due.length);
      setSessionDone(0);
      setFinished(false);
      setRevealed(false);
    }, [getDueWords])
  );

  const advance = (nextQueue: Word[]) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setQueue(nextQueue);
    setRevealed(false);
    setSubmitting(false);
    setSessionDone((d) => d + 1);
    if (nextQueue.length === 0) setFinished(true);
  };

  const handleKnew = async () => {
    if (!queue[0]) return;
    setSubmitting(true);
    reviewWord(queue[0].id, true);
    advance(queue.slice(1));
  };

  const handleDidNotKnow = async () => {
    if (!queue[0]) return;
    setSubmitting(true);
    reviewWord(queue[0].id, false);
    setRevealed(true);
    setSubmitting(false);
  };

  const handleContinue = () => {
    advance(queue.slice(1));
  };

  if (finished || (sessionTotal > 0 && queue.length === 0)) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="🎉"
          title="Oturum Tamamlandı!"
          description={`Bugün ${sessionDone} kelimeyi tekrar ettin. Harika iş!`}
        />
      </View>
    );
  }

  if (sessionTotal === 0 || queue.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="✅"
          title="Bugün tamamlandı!"
          description="Bugün tekrar edilecek kelime kalmadı. Yarın yeni kelimeler seni bekliyor."
        />
      </View>
    );
  }

  const current = queue[0];
  const progress = sessionTotal > 0 ? sessionDone / sessionTotal : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tekrar</Text>
        <Text style={styles.counter}>{sessionDone + 1} / {sessionTotal}</Text>
      </View>

      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <Animated.View style={[styles.cardWrapper, { opacity: fadeAnim }]}>
        <FlashCard key={current.id} word={current} revealed={revealed} />
      </Animated.View>

      <View style={styles.buttonsWrapper}>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  counter: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: AppColors.border,
    borderRadius: 3,
    marginBottom: 28,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: AppColors.primary,
    borderRadius: 3,
  },
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonsWrapper: {
    paddingBottom: 32,
    paddingTop: 16,
  },
});
