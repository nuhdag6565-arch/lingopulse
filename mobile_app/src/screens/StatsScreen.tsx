import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../components/common/Card';
import { useWords } from '../hooks/useWords';

export const StatsScreen: React.FC = () => {
  const { words } = useWords();

  const byLevel = [0, 1, 2, 3, 4, 5].map((l) => ({
    level: l,
    count: words.filter((w) => w.learning_level === l).length,
  }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Öğrenme Durumu</Text>
      <Card>
        {byLevel.map(({ level, count }) => (
          <View key={level} style={styles.row}>
            <Text style={styles.levelLabel}>Seviye {level}</Text>
            <View style={styles.barBg}>
              <View
                style={[
                  styles.bar,
                  { width: `${words.length ? (count / words.length) * 100 : 0}%` },
                ]}
              />
            </View>
            <Text style={styles.count}>{count}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, gap: 16, backgroundColor: '#F5F3FF' },
  title: { fontSize: 22, fontWeight: '800', color: '#1E1B4B' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 6 },
  levelLabel: { width: 64, fontSize: 13, color: '#6B7280' },
  barBg: { flex: 1, height: 12, backgroundColor: '#E5E7EB', borderRadius: 99, overflow: 'hidden' },
  bar: { height: '100%', backgroundColor: '#4F46E5', borderRadius: 99 },
  count: { width: 28, textAlign: 'right', fontSize: 13, fontWeight: '600', color: '#374151' },
});
