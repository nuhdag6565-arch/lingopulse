import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppColors, type AppColorsType } from '@/src/context/ThemeContext';

interface Props {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const createStyles = (c: AppColorsType) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  icon: { fontSize: 56, marginBottom: 4 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: c.textPrimary,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: c.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: 8,
    backgroundColor: c.primary,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 13,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export function EmptyState({ icon, title, description, actionLabel, onAction }: Props) {
  const c = useAppColors();
  const styles = useMemo(() => createStyles(c), [c]);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction} activeOpacity={0.85}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
