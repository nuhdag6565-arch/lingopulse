import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WordForm } from '../components/word/WordForm';
import { useWords } from '../hooks/useWords';
import type { WordCreate } from '../types/word';

export const AddWordScreen: React.FC = () => {
  const nav = useNavigation();
  const { loading, createWord } = useWords();

  const handleSubmit = async (data: WordCreate) => {
    const result = await createWord(data);
    if ('error' in result && result.error) {
      Alert.alert('Hata', String(result.error));
    } else {
      nav.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <WordForm onSubmit={handleSubmit} loading={loading} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FF' },
  inner: { padding: 24, gap: 16 },
});
