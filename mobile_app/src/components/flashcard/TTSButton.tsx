import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, Text } from 'react-native';
import * as Speech from 'expo-speech';

interface Props {
  text: string;
  language?: string;
  size?: number;
}

export const TTSButton: React.FC<Props> = ({ text, language = 'en-US', size = 22 }) => {
  const [speaking, setSpeaking] = useState(false);

  const speak = () => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(text, {
      language,
      rate: 0.82,
      onDone: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  return (
    <TouchableOpacity
      style={[styles.btn, { width: size * 2, height: size * 2 }]}
      onPress={speak}
      activeOpacity={0.7}
    >
      {speaking
        ? <ActivityIndicator size="small" color="#4F46E5" />
        : <Text style={{ fontSize: size - 2 }}>🔊</Text>
      }
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
