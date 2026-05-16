import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FlashCard } from '../components/flashcard/FlashCard';
import { ReviewButtons } from '../components/flashcard/ReviewButtons';
import { Loading } from '../components/common/Loading';
import { useReview } from '../hooks/useReview';

export const FlashCardScreen: React.FC = () => {
  const { dueWords, loading, review } = useReview();
  const [index, setIndex] = useState(0);

  if (loading && dueWords.length === 0) return <Loading />;

  if (dueWords.length === 0) {
    return (
      <View style={styles.done}>
        <Text style={styles.doneEmoji}>🎉</Text>
        <Text style={styles.doneText}>Harika! Bugünlük tüm tekrarları tamamladın.</Text>
      </View>
    );
  }

  const current = dueWords[index];

  const handleReview = async (knewIt: boolean) => {
    await review(current.id, knewIt);
    if (index < dueWords.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setIndex(0);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.counter}>
        {index + 1} / {dueWords.length}
      </Text>
      <FlashCard word={current} />
      <ReviewButtons
        onKnew={() => handleReview(true)}
        onDidNotKnow={() => handleReview(false)}
        loading={loading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, gap: 20, backgroundColor: '#F5F3FF' },
  counter: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, fontWeight: '600' },
  done: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  doneEmoji: { fontSize: 64 },
  doneText: { fontSize: 20, fontWeight: '700', color: '#1E1B4B', textAlign: 'center' },
});
