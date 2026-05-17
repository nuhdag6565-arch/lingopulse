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

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const { register, loading, error, clearError } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  useEffect(() => {
    if (error) {
      Toast.show({ type: 'error', text1: 'Kayıt Hatası', text2: error });
      clearError();
    }
  }, [error]);

  const handleRegister = async () => {
    if (password !== confirm) {
      Toast.show({ type: 'error', text1: 'Şifreler eşleşmiyor' });
      return;
    }
    if (password.length < 8) {
      Toast.show({ type: 'error', text1: 'Şifre en az 8 karakter olmalı' });
      return;
    }
    await register({ email: email.trim().toLowerCase(), password, full_name: fullName.trim() });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>🧠</Text>
        <Text style={styles.title}>Hesap Oluştur</Text>

        <TextInput style={styles.input} placeholder="Ad Soyad (opsiyonel)"
          value={fullName} onChangeText={setFullName} placeholderTextColor="#9CA3AF" />
        <TextInput style={styles.input} placeholder="E-posta"
          value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none"
          autoCorrect={false} placeholderTextColor="#9CA3AF" />
        <TextInput style={styles.input} placeholder="Şifre (min. 8 karakter)"
          value={password} onChangeText={setPassword}
          secureTextEntry placeholderTextColor="#9CA3AF" />
        <TextInput style={styles.input} placeholder="Şifre tekrar"
          value={confirm} onChangeText={setConfirm}
          secureTextEntry placeholderTextColor="#9CA3AF" />

        <Button label="Kayıt Ol" onPress={handleRegister} loading={loading} style={styles.btn} />

        <TouchableOpacity onPress={() => nav.navigate('Login')} style={styles.link}>
          <Text style={styles.linkText}>
            Zaten hesabın var mı? <Text style={styles.linkBold}>Giriş Yap</Text>
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
  title: { fontSize: 26, fontWeight: '800', color: '#1E1B4B', textAlign: 'center', marginBottom: 8 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, padding: 14, fontSize: 16, color: '#111827',
  },
  btn: { marginTop: 4 },
  link: { alignItems: 'center', marginTop: 8 },
  linkText: { color: '#6B7280', fontSize: 14 },
  linkBold: { color: '#4F46E5', fontWeight: '700' },
});
