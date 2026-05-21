import * as Speech from 'expo-speech';

export function useTTS() {
  const speak = (text: string, lang = 'en-US') => {
    Speech.stop();
    Speech.speak(text, { language: lang, rate: 0.85 });
  };

  const stop = () => Speech.stop();

  return { speak, stop };
}
