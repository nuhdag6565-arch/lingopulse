import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWords } from '@/src/context/WordContext';
import { EmptyState } from '@/src/components/EmptyState';
import { AppColors } from '@/src/constants/colors';

export default function ListsScreen() {
  const { lists, isLoadingLists, loadLists, deleteList } = useWords();

  useFocusEffect(
    useCallback(() => {
      loadLists();
    }, [loadLists]),
  );

  const confirmDelete = (id: string, name: string) => {
    Alert.alert(
      'Listeyi Sil',
      `"${name}" listesi ve içindeki tüm kelimeler silinecek. Devam edilsin mi?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteList(id);
            } catch {
              Alert.alert('Hata', 'Liste silinemedi.');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Listelerim</Text>
          <Text style={styles.subtitle}>{lists.length} liste</Text>
        </View>
      </View>

      {isLoadingLists && lists.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={AppColors.primary} />
        </View>
      ) : lists.length === 0 ? (
        <EmptyState
          icon="📚"
          title="Henüz listeniz yok"
          description="İlk kelime listenizi oluşturun ve öğrenmek istediğiniz kelimeleri ekleyin."
          actionLabel="+ Yeni Liste Oluştur"
          onAction={() => router.push('/create-list')}
        />
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onPress={() => router.push(`/list/${item.id}` as any)}
              activeOpacity={0.88}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.cardIcon}>📖</Text>
                <View>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardCount}>{item.wordCount} kelime</Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <Ionicons name="chevron-forward" size={18} color={AppColors.textMuted} />
                <TouchableOpacity
                  onPress={() => confirmDelete(item.id, item.name)}
                  style={styles.deleteBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color={AppColors.error} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/create-list')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingTop: 60,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginTop: 3,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  cardIcon: {
    fontSize: 28,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  cardCount: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteBtn: {
    padding: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
});
