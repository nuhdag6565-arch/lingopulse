import { useMemo, useState } from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, Text } from 'react-native';
import * as Speech from 'expo-speech';
import { useAppColors, type AppColorsType } from '@/src/context/ThemeContext';
import { useTTS } from '@/src/context/TTSContext';

interface Props {
  text: string;
  language?: string;
  size?: number;
}

const createStyles = (c: AppColorsType) => StyleSheet.create({
  btn: {
    backgroundColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export function TTSButton({ text, language = 'en-US', size = 20 }: Props) {
  const [speaking, setSpeaking] = useState(false);
  const { ttsRate } = useTTS();
  const c = useAppColors();
  const styles = useMemo(() => createStyles(c), [c]);

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
        <ActivityIndicator size="small" color={c.primary} />
      ) : (
        <Text style={{ fontSize: size - 2 }}>🔊</Text>
      )}
    </TouchableOpacity>
  );
}
