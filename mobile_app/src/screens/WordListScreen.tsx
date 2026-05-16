import React from 'react';
import { FlatList, View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { WordCard } from '../components/word/WordCard';
import { Loading } from '../components/common/Loading';
import { Button } from '../components/common/Button';
import { useWords } from '../hooks/useWords';

type Nav = NativeStackNavigationProp<RootStackParamList, 'WordList'>;

export const WordListScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const { words, loading, deleteWord, refresh } = useWords();

  const confirmDelete = (id: string, word: string) => {
    Alert.alert('Sil', `"${word}" silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deleteWord(id) },
    ]);
  };

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <FlatList
        data={words}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WordCard word={item} onDelete={() => confirmDelete(item.id, item.word)} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Henüz kelime eklenmemiş.</Text>
        }
        onRefresh={refresh}
        refreshing={loading}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
      <Button label="+ Yeni Kelime" onPress={() => nav.navigate('AddWord')} style={styles.fab} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FF' },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 48, fontSize: 16 },
  fab: { margin: 16 },
});
