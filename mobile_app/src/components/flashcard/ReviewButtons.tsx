import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '../common/Button';

interface Props {
  onKnew: () => void;
  onDidNotKnow: () => void;
  loading?: boolean;
}

export const ReviewButtons: React.FC<Props> = ({ onKnew, onDidNotKnow, loading }) => (
  <View style={styles.row}>
    <Button
      label="Bilmiyorum"
      variant="danger"
      onPress={onDidNotKnow}
      loading={loading}
      style={styles.btn}
    />
    <Button
      label="Biliyorum"
      variant="success"
      onPress={onKnew}
      loading={loading}
      style={styles.btn}
    />
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginTop: 20 },
  btn: { flex: 1 },
});
