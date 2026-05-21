import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'success' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const COLORS = {
  primary: '#4F46E5',
  danger: '#EF4444',
  success: '#22C55E',
  ghost: 'transparent',
};

export const Button: React.FC<Props> = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) => {
  const bg = COLORS[variant];
  return (
    <TouchableOpacity
      style={[styles.base, { backgroundColor: bg }, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.label, variant === 'ghost' && styles.ghostLabel]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.5 },
  label: { color: '#fff', fontSize: 16, fontWeight: '600' },
  ghostLabel: { color: '#4F46E5' },
});
