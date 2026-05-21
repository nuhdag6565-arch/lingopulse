import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Button } from '../components/common/Button';
import { TTSButton } from '../components/flashcard/TTSButton';
import { useWords } from '../hooks/useWords';
import type { WordCreate } from '../types/word';
import type { Word } from '../types/word';

export const AddWordScreen: React.FC = () => {
  const nav = useNavigation();
  const { loading, createWord } = useWords();

  const [word, setWord]       = useState('');
  const [meaning, setMeaning] = useState('');
  const [saved, setSaved]     = useState<Word | null>(null);

  const canSubmit = word.trim().length > 0 && meaning.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const data: WordCreate = { word: word.trim(), meaning: meaning.trim() };
    const result = await createWord(data);

    const action = result as { meta?: { requestStatus: string }; payload?: unknown };
    if (action.meta?.requestStatus === 'fulfilled') {
      setSaved(action.payload as Word);
      setWord('');
      setMeaning('');
      Toast.show({ type: 'success', text1: 'Kelime eklendi!', text2: 'AI cümle oluşturuldu.' });
    } else {
      const rejected = result as { error?: { message?: string } };
      Toast.show({ type: 'error', text1: 'Hata', text2: rejected.error?.message ?? 'Bir hata oluştu.' });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionTitle}>Yeni Kelime</Text>

        <View style={styles.field}>
          <Text style={styles.label}>İngilizce kelime</Text>
          <TextInput
            style={styles.input}
            value={word}
            onChangeText={setWord}
            placeholder="Örn: resilience"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Türkçe anlamı</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={meaning}
            onChangeText={setMeaning}
            placeholder="Örn: dayanıklılık, esneklik"
            multiline
            numberOfLines={2}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.aiNote}>
          <Text style={styles.aiIcon}>✨</Text>
          <Text style={styles.aiText}>
            Kaydet butonuna basınca yapay zeka bu kelimeyi içeren bir cümle otomatik oluşturur.
          </Text>
        </View>

        <Button
          label={loading ? 'Oluşturuluyor...' : 'Kaydet & AI Cümle Üret'}
          onPress={handleSubmit}
          loading={loading}
          disabled={!canSubmit || loading}
        />

        {/* AI tarafından üretilen cümleyi göster */}
        {saved && (
          <View style={styles.resultCard}>
            <View style={styles.resultWordRow}>
              <Text style={styles.resultWord}>{saved.word}</Text>
              <TTSButton text={saved.word} language="en-US" size={18} />
            </View>
            <Text style={styles.resultMeaning}>{saved.meaning}</Text>

            {saved.example_sentence ? (
              <View style={styles.sentenceBox}>
                <View style={styles.sentenceHeader}>
                  <Text style={styles.sentenceLabel}>AI ÖRNEK CÜMLE</Text>
                  <TTSButton text={saved.example_sentence} language="en-US" size={16} />
                </View>
                <Text style={styles.sentence}>"{saved.example_sentence}"</Text>
                {saved.example_sentence_translation ? (
                  <Text style={styles.sentenceTr}>{saved.example_sentence_translation}</Text>
                ) : null}
              </View>
            ) : (
              <View style={styles.sentenceBox}>
                <ActivityIndicator size="small" color="#4F46E5" />
                <Text style={styles.sentenceGenerating}>Cümle oluşturuluyor...</Text>
              </View>
            )}

            <Button
              label="Kelime Listesine Git"
              variant="ghost"
              onPress={() => nav.goBack()}
              style={styles.listBtn}
            />
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F5F3FF' },
  container: { padding: 24, gap: 16, flexGrow: 1 },

  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#1E1B4B' },

  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111827',
  },
  multiline: { minHeight: 72, textAlignVertical: 'top' },

  aiNote: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    alignItems: 'flex-start',
  },
  aiIcon: { fontSize: 16 },
  aiText: { fontSize: 13, color: '#4F46E5', flex: 1, lineHeight: 18 },

  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  resultWordRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultWord: { fontSize: 22, fontWeight: '800', color: '#1E1B4B' },
  resultMeaning: { fontSize: 14, color: '#6B7280' },

  sentenceBox: {
    backgroundColor: '#F5F3FF',
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  sentenceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sentenceLabel: { fontSize: 9, fontWeight: '700', color: '#818CF8', letterSpacing: 1.5 },
  sentence: { fontSize: 14, color: '#374151', fontStyle: 'italic', lineHeight: 20 },
  sentenceTr: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  sentenceGenerating: { fontSize: 13, color: '#9CA3AF' },

  listBtn: { marginTop: 4 },
});
