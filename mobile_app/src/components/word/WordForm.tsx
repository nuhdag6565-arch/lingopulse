import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { Button } from '../common/Button';
import type { WordCreate } from '../../types/word';

interface Props {
  onSubmit: (data: WordCreate) => void;
  loading?: boolean;
}

export const WordForm: React.FC<Props> = ({ onSubmit, loading }) => {
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');

  const handleSubmit = () => {
    if (word.trim() && meaning.trim()) {
      onSubmit({ word: word.trim(), meaning: meaning.trim() });
      setWord('');
      setMeaning('');
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.label}>İngilizce Kelime</Text>
      <TextInput
        style={styles.input}
        value={word}
        onChangeText={setWord}
        placeholder="Örn: serendipity"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={styles.label}>Türkçe Anlam</Text>
      <TextInput
        style={styles.input}
        value={meaning}
        onChangeText={setMeaning}
        placeholder="Örn: güzel bir tesadüf"
        multiline
      />
      <Button
        label="Kelime Ekle (AI ile zenginleştir)"
        onPress={handleSubmit}
        loading={loading}
        disabled={!word.trim() || !meaning.trim()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  form: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 2 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
});
