import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';
import { useWords } from '../hooks/useWords';
import { useReview } from '../hooks/useReview';
import { useNotifications } from '../hooks/useNotifications';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

type Nav = NativeStackNavigationProp<AppStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const nav  = useNavigation<Nav>();
  const user = useSelector((s: RootState) => s.auth.user);
  useNotifications();

  const { total }     = useWords();
  const { dueWords }  = useReview();
  const dueCount      = dueWords.length;

  const firstName = user?.full_name?.split(' ')[0] ?? 'Merhaba';

  return (
    <View style={styles.screen}>
      {/* Karşılama */}
      <View style={styles.greeting}>
        <Text style={styles.greetHi}>Merhaba, {firstName} 👋</Text>
        <Text style={styles.greetSub}>Bugün biraz kelime çalışalım mı?</Text>
      </View>

      {/* Tekrar kartı — ana eylem */}
      <TouchableOpacity
        style={[styles.reviewCard, dueCount === 0 && styles.reviewCardDone]}
        onPress={() => nav.navigate('FlashCard')}
        activeOpacity={0.88}
      >
        <Text style={styles.reviewCount}>{dueCount}</Text>
        <Text style={styles.reviewLabel}>tekrar bekliyor</Text>
        <Text style={styles.reviewCta}>{dueCount > 0 ? 'Tekrara Başla →' : 'Harika, hepsi tamam 🎉'}</Text>
      </TouchableOpacity>

      {/* İstatistik çubukları */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{total}</Text>
          <Text style={styles.statLabel}>Toplam Kelime</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: '#22C55E' }]}>{total - dueCount}</Text>
          <Text style={styles.statLabel}>Öğrenildi</Text>
        </View>
      </View>

      {/* Alt kısa yollar */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => nav.navigate('AddWord')}>
          <Text style={styles.actionIcon}>＋</Text>
          <Text style={styles.actionLabel}>Kelime Ekle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => nav.navigate('WordList')}>
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionLabel}>Kelime Listem</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => nav.navigate('Stats')}>
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionLabel}>İstatistikler</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F3FF', padding: 24, gap: 20 },

  greeting: { marginTop: 8 },
  greetHi:  { fontSize: 24, fontWeight: '800', color: '#1E1B4B' },
  greetSub: { fontSize: 14, color: '#9CA3AF', marginTop: 2 },

  reviewCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  reviewCardDone: { backgroundColor: '#22C55E', shadowColor: '#22C55E' },
  reviewCount: { fontSize: 56, fontWeight: '900', color: '#fff', lineHeight: 62 },
  reviewLabel: { fontSize: 15, color: '#C7D2FE', fontWeight: '500' },
  reviewCta:   { fontSize: 15, color: '#fff', fontWeight: '700', marginTop: 8 },

  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statNum:   { fontSize: 28, fontWeight: '800', color: '#4F46E5' },
  statLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon:  { fontSize: 22 },
  actionLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280', textAlign: 'center' },
});
