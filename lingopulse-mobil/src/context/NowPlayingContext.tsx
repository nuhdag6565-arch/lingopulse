import React, { createContext, useContext, useRef, useState } from 'react';

export interface NowPlayingState {
  isPlaying: boolean;
  currentWord: { word: string; meaning: string } | null;
  currentListName: string | null;
  progress: number;
  hasPrevList: boolean;
  hasNextList: boolean;
}

export interface NowPlayingControls {
  toggle: () => void;
  skipPrevWord: () => void;
  skipNextWord: () => void;
  skipPrevList: () => void;
  skipNextList: () => void;
  openPlayer: () => void;
}

interface NowPlayingContextType {
  nowPlaying: NowPlayingState;
  setNowPlaying: (state: Partial<NowPlayingState>) => void;
  controls: React.MutableRefObject<NowPlayingControls>;
}

const NowPlayingContext = createContext<NowPlayingContextType>({
  nowPlaying: { isPlaying: false, currentWord: null, currentListName: null, progress: 0, hasPrevList: false, hasNextList: false },
  setNowPlaying: () => {},
  controls: { current: { toggle: () => {}, skipPrevWord: () => {}, skipNextWord: () => {}, skipPrevList: () => {}, skipNextList: () => {}, openPlayer: () => {} } },
});

export function NowPlayingProvider({ children }: { children: React.ReactNode }) {
  const [nowPlaying, setNowPlayingState] = useState<NowPlayingState>({
    isPlaying: false,
    currentWord: null,
    currentListName: null,
    progress: 0,
    hasPrevList: false,
    hasNextList: false,
  });

  const controls = useRef<NowPlayingControls>({
    toggle: () => {},
    skipPrevWord: () => {},
    skipNextWord: () => {},
    skipPrevList: () => {},
    skipNextList: () => {},
    openPlayer: () => {},
  });

  const setNowPlaying = (state: Partial<NowPlayingState>) => {
    setNowPlayingState(prev => ({ ...prev, ...state }));
  };

  return (
    <NowPlayingContext.Provider value={{ nowPlaying, setNowPlaying, controls }}>
      {children}
    </NowPlayingContext.Provider>
  );
}

export function useNowPlaying() {
  return useContext(NowPlayingContext);
}
