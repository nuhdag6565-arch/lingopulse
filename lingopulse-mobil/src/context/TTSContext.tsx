import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const SPEED_KEY = 'tts_speed';

interface TTSContextType {
  ttsRate: number;
  ttsSpeedValue: string;
  setTtsSpeed: (value: string) => Promise<void>;
}

const TTSContext = createContext<TTSContextType>({
  ttsRate: 1.0,
  ttsSpeedValue: '1.0',
  setTtsSpeed: async () => {},
});

export function TTSProvider({ children }: { children: React.ReactNode }) {
  const [ttsRate, setTtsRate] = useState(1.0);
  const [ttsSpeedValue, setTtsSpeedValue] = useState('1.0');

  useEffect(() => {
    SecureStore.getItemAsync(SPEED_KEY).then((v) => {
      if (v) {
        setTtsRate(parseFloat(v));
        setTtsSpeedValue(v);
      }
    });
  }, []);

  const setTtsSpeed = async (value: string) => {
    setTtsRate(parseFloat(value));
    setTtsSpeedValue(value);
    await SecureStore.setItemAsync(SPEED_KEY, value);
  };

  return (
    <TTSContext.Provider value={{ ttsRate, ttsSpeedValue, setTtsSpeed }}>
      {children}
    </TTSContext.Provider>
  );
}

export function useTTS() {
  return useContext(TTSContext);
}
