import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

interface Props {
  revealed: boolean;
  loading: boolean;
  onKnew: () => void;
  onDidNotKnow: () => void;
  onContinue: () => void;
}

export const ReviewButtons: React.FC<Props> = ({
  revealed, loading, onKnew, onDidNotKnow, onContinue,
}) => {
  if (loading) {
    return (
      <View style={styles.loadingRow}>
        <ActivityIndicator color="#4F46E5" />
      </View>
    );
  }

  if (revealed) {
    return (
      <View style={styles.continueRow}>
        <TouchableOpacity style={styles.continueBtn} onPress={onContinue} activeOpacity={0.85}>
          <Text style={styles.continueText}>Devam Et  →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {/* Sol alt — Bilmiyorum */}
      <TouchableOpacity style={[styles.btn, styles.dontKnow]} onPress={onDidNotKnow} activeOpacity={0.85}>
        <Text style={styles.btnIcon}>✕</Text>
        <Text style={styles.btnLabel}>Bilmiyorum</Text>
      </TouchableOpacity>

      {/* Sağ alt — Biliyorum */}
      <TouchableOpacity style={[styles.btn, styles.know]} onPress={onKnew} activeOpacity={0.85}>
        <Text style={styles.btnIcon}>✓</Text>
        <Text style={styles.btnLabel}>Biliyorum</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
  },
  loadingRow: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    flex: 1,
    height: 72,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  dontKnow: {
    backgroundColor: '#FEE2E2',
    shadowColor: '#EF4444',
  },
  know: {
    backgroundColor: '#DCFCE7',
    shadowColor: '#22C55E',
  },
  btnIcon: {
    fontSize: 20,
    fontWeight: '800',
    color: '#374151',
  },
  btnLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  continueRow: {
    paddingHorizontal: 24,
  },
  continueBtn: {
    height: 72,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  continueText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});
