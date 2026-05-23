import { useState } from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, Text } from 'react-native';
import * as Speech from 'expo-speech';
import { AppColors } from '@/src/constants/colors';
import { useTTS } from '@/src/context/TTSContext';

interface Props {
  text: string;
  language?: string;
  size?: number;
}

export function TTSButton({ text, language = 'en-US', size = 20 }: Props) {
  const [speaking, setSpeaking] = useState(false);
  const { ttsRate } = useTTS();

  const handlePress = () => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(text, {
      language,
      rate: ttsRate,
      onDone: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  return (
    <TouchableOpacity
      style={[styles.btn, { width: size * 2, height: size * 2, borderRadius: size }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {speaking ? (
        <ActivityIndicator size="small" color={AppColors.primary} />
      ) : (
        <Text style={{ fontSize: size - 2 }}>🔊</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
