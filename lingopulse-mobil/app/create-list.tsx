import { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useWords } from '@/src/context/WordContext';
import { AppColors } from '@/src/constants/colors';

export default function CreateListScreen() {
  const { createList } = useWords();
  const nameRef = useRef('');
  const [hasInput, setHasInput] = useState(false);

  const handleCreate = () => {
    const name = nameRef.current.trim();
    if (!name) return;
    createList(name);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>Yeni Liste</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Liste Adı</Text>
        <TextInput
          style={styles.input}
          placeholder="örn: İş İngilizcesi, Seyahat, IELTS..."
          placeholderTextColor={AppColors.textMuted}
          onChangeText={(t) => {
            nameRef.current = t;
            setHasInput(t.trim().length > 0);
          }}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleCreate}
          maxLength={100}
        />

        <TouchableOpacity
          style={[styles.button, !hasInput && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={!hasInput}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Liste Oluştur</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  inner: {
    flex: 1,
    padding: 24,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 8,
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
    marginBottom: 20,
  },
  button: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
