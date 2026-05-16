import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Button } from '../components/common/Button';
import { useWords } from '../hooks/useWords';
import { useReview } from '../hooks/useReview';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const { total } = useWords();
  const { dueWords } = useReview();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Merhaba!</Text>
      <Text style={styles.subtitle}>Bugün öğrenmek için hazır mısın?</Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{total}</Text>
          <Text style={styles.statLabel}>Toplam Kelime</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: '#EF4444' }]}>{dueWords.length}</Text>
          <Text style={styles.statLabel}>Tekrar Bekleyen</Text>
        </View>
      </View>

      <Button label="Tekrara Başla" onPress={() => nav.navigate('FlashCard')} style={styles.btn} />
      <Button label="Kelime Listesi" variant="ghost" onPress={() => nav.navigate('WordList')} style={styles.btn} />
      <Button label="Yeni Kelime Ekle" variant="ghost" onPress={() => nav.navigate('AddWord')} style={styles.btn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, gap: 16, backgroundColor: '#F5F3FF' },
  title: { fontSize: 28, fontWeight: '800', color: '#1E1B4B' },
  subtitle: { fontSize: 16, color: '#6B7280', marginTop: -8 },
  statsRow: { flexDirection: 'row', gap: 12, marginVertical: 8 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', elevation: 2 },
  statNum: { fontSize: 32, fontWeight: '800', color: '#4F46E5' },
  statLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  btn: { marginTop: 4 },
});
