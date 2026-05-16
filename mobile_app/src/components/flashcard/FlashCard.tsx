import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Card } from '../common/Card';
import { TTSButton } from './TTSButton';
import type { Word } from '../../types/word';

interface Props {
  word: Word;
}

export const FlashCard: React.FC<Props> = ({ word }) => {
  const [revealed, setReveal] = useState(false);

  return (
    <Card style={styles.card}>
      <View style={styles.front}>
        <Text style={styles.wordText}>{word.word}</Text>
        <TTSButton text={word.word} />
      </View>

      {!revealed ? (
        <TouchableOpacity style={styles.revealBtn} onPress={() => setReveal(true)}>
          <Text style={styles.revealText}>Anlamı Göster</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.back}>
          <Text style={styles.meaningText}>{word.meaning}</Text>
          {word.example_sentence ? (
            <>
              <Text style={styles.exampleText}>"{word.example_sentence}"</Text>
              <Text style={styles.translationText}>{word.example_sentence_translation}</Text>
              <TTSButton text={word.example_sentence} label="Cümleyi Dinle" />
            </>
          ) : null}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { minHeight: 240, justifyContent: 'space-between' },
  front: { alignItems: 'center', gap: 8 },
  wordText: { fontSize: 32, fontWeight: '700', color: '#1E1B4B', textAlign: 'center' },
  revealBtn: { marginTop: 16, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#4F46E5', alignItems: 'center' },
  revealText: { color: '#4F46E5', fontWeight: '600' },
  back: { gap: 8 },
  meaningText: { fontSize: 20, fontWeight: '600', color: '#374151', textAlign: 'center' },
  exampleText: { fontSize: 14, color: '#6B7280', fontStyle: 'italic', textAlign: 'center' },
  translationText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
});
