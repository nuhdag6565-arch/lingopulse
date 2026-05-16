import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';

interface Props {
  text: string;
  label?: string;
}

export const TTSButton: React.FC<Props> = ({ text, label = 'Seslendir' }) => {
  const speak = () => {
    Speech.speak(text, { language: 'en-US', rate: 0.85 });
  };

  return (
    <TouchableOpacity style={styles.btn} onPress={speak}>
      <Text style={styles.label}>🔊 {label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#EEF2FF' },
  label: { color: '#4F46E5', fontSize: 13, fontWeight: '500' },
});
