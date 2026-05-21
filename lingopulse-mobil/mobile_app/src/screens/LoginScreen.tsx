import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import type { AuthStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const { login, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (error) {
      Toast.show({ type: 'error', text1: 'Giriş Hatası', text2: error });
      clearError();
    }
  }, [error]);

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    await login({ email: email.trim().toLowerCase(), password });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>🧠</Text>
        <Text style={styles.title}>LingoPulse'a Hoş Geldin</Text>
        <Text style={styles.subtitle}>Her gün biraz daha iyi</Text>

        <TextInput
          style={styles.input}
          placeholder="E-posta"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor="#9CA3AF"
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#9CA3AF"
        />

        <Button label="Giriş Yap" onPress={handleLogin} loading={loading} style={styles.btn} />

        <TouchableOpacity onPress={() => nav.navigate('Register')} style={styles.link}>
          <Text style={styles.linkText}>
            Hesabın yok mu? <Text style={styles.linkBold}>Kayıt Ol</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F5F3FF' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 28, gap: 14 },
  logo: { fontSize: 56, textAlign: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: '#1E1B4B', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginTop: -8, marginBottom: 8 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, padding: 14, fontSize: 16, color: '#111827',
  },
  btn: { marginTop: 4 },
  link: { alignItems: 'center', marginTop: 8 },
  linkText: { color: '#6B7280', fontSize: 14 },
  linkBold: { color: '#4F46E5', fontWeight: '700' },
});
