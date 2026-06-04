import { useMemo, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useWords } from '@/src/context/WordContext';
import { useAppColors, type AppColorsType } from '@/src/context/ThemeContext';

const createStyles = (c: AppColorsType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  scroll: { padding: 24, paddingTop: 16, flexGrow: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 22, fontWeight: '800', color: c.textPrimary },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: c.border, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 14, color: c.textSecondary, fontWeight: '700' },
  form: { gap: 18, flex: 1 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: c.textPrimary },
  input: {
    backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: c.textPrimary,
  },
  addBtn: { backgroundColor: c.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  addBtnDisabled: { opacity: 0.6 },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default function AddWordScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const { addWord } = useWords();
  const c = useAppColors();
  const styles = useMemo(() => createStyles(c), [c]);
  const wordRef = useRef('');
  const meaningRef = useRef('');
  const meaningInputRef = useRef<TextInput>(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    const word = wordRef.current.trim();
    const meaning = meaningRef.current.trim();
    if (!word || !meaning) { Alert.alert('Hata', 'Kelime ve anlam alanları zorunludur.'); return; }
    if (!listId) { Alert.alert('Hata', 'Liste seçilmedi.'); return; }
    setLoading(true);
    try { await addWord(word, meaning, listId); router.back(); }
    catch { Alert.alert('Hata', 'Kelime eklenirken bir sorun oluştu.'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Yeni Kelime</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kelime</Text>
            <TextInput style={styles.input} placeholder="örn: serendipity" placeholderTextColor={c.textMuted} onChangeText={(t) => { wordRef.current = t; }} autoCapitalize="none" autoFocus />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Türkçe Anlam</Text>
            <TextInput ref={meaningInputRef} style={styles.input} placeholder="örn: tesadüfen güzel şeyler keşfetme" placeholderTextColor={c.textMuted} onChangeText={(t) => { meaningRef.current = t; }} autoCapitalize="none" spellCheck={false} />
          </View>
        </View>
        <TouchableOpacity style={[styles.addBtn, loading && styles.addBtnDisabled]} onPress={handleAdd} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>Kelime Ekle</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
