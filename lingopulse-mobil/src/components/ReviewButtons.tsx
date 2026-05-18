import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { AppColors } from '@/src/constants/colors';

interface Props {
  revealed: boolean;
  loading: boolean;
  onKnew: () => void;
  onDidNotKnow: () => void;
  onContinue: () => void;
}

export function ReviewButtons({ revealed, loading, onKnew, onDidNotKnow, onContinue }: Props) {
  if (loading) {
    return (
      <View style={styles.loadingRow}>
        <ActivityIndicator color={AppColors.primary} />
      </View>
    );
  }

  if (revealed) {
    return (
      <TouchableOpacity style={styles.continueBtn} onPress={onContinue} activeOpacity={0.85}>
        <Text style={styles.continueBtnText}>Devam Et →</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.row}>
      <TouchableOpacity style={[styles.btn, styles.noBtn]} onPress={onDidNotKnow} activeOpacity={0.85}>
        <Text style={styles.noText}>✗  Bilmiyorum</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.yesBtn]} onPress={onKnew} activeOpacity={0.85}>
        <Text style={styles.yesText}>✓  Biliyorum</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingRow: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  noBtn: {
    backgroundColor: '#FEE2E2',
  },
  yesBtn: {
    backgroundColor: '#D1FAE5',
  },
  noText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },
  yesText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
  },
  continueBtn: {
    backgroundColor: AppColors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
