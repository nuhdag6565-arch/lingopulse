import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useWords } from '@/src/context/WordContext';
import { AppColors } from '@/src/constants/colors';

const LANGUAGES = [
  { code: 'en-US', label: '🇺🇸 İngilizce' },
  { code: 'de-DE', label: '🇩🇪 Almanca' },
  { code: 'fr-FR', label: '🇫🇷 Fransızca' },
  { code: 'es-ES', label: '🇪🇸 İspanyolca' },
];

export default function AddWordScreen() {
  const { addWord, isGenerating } = useWords();
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [language, setLanguage] = useState('en-US');

  const handleAdd = async () => {
    if (!word.trim() || !meaning.trim()) {
      Alert.alert('Hata', 'Kelime ve anlam alanları zorunludur.');
      return;
    }
    await addWord(word, meaning, language);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Yeni Kelime</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kelime</Text>
            <TextInput
              style={styles.input}
              placeholder="örn: serendipity"
              placeholderTextColor={AppColors.textMuted}
              value={word}
              onChangeText={setWord}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Türkçe Anlam</Text>
            <TextInput
              style={styles.input}
              placeholder="örn: tesadüfen güzel şeyler keşfetme"
              placeholderTextColor={AppColors.textMuted}
              value={meaning}
              onChangeText={setMeaning}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dil</Text>
            <View style={styles.langRow}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langBtn, language === lang.code && styles.langBtnActive]}
                  onPress={() => setLanguage(lang.code)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.langBtnText, language === lang.code && styles.langBtnTextActive]}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.aiNote}>
            <Text style={styles.aiNoteIcon}>🤖</Text>
            <Text style={styles.aiNoteText}>
              Kelime eklendikten sonra yapay zeka otomatik olarak bir örnek cümle oluşturacak.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, (isGenerating || !word.trim() || !meaning.trim()) && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={isGenerating || !word.trim() || !meaning.trim()}
          activeOpacity={0.85}
        >
          {isGenerating ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.addBtnText}>Cümle üretiliyor...</Text>
            </View>
          ) : (
            <Text style={styles.addBtnText}>Kelime Ekle</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scroll: {
    padding: 24,
    paddingTop: 16,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: '700',
  },
  form: {
    gap: 18,
    flex: 1,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  input: {
    backgroundColor: AppColors.surface,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: AppColors.textPrimary,
  },
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: AppColors.surface,
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  langBtnActive: {
    backgroundColor: '#EEF2FF',
    borderColor: AppColors.primary,
  },
  langBtnText: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  langBtnTextActive: {
    color: AppColors.primary,
    fontWeight: '700',
  },
  aiNote: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  aiNoteIcon: {
    fontSize: 18,
  },
  aiNoteText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  addBtn: {
    backgroundColor: AppColors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
});
