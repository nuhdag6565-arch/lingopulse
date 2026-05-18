import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Word {
  id: string;
  word: string;
  meaning: string;
  exampleSentence: string;
  language: string;
  easeFactor: number;
  intervalDays: number;
  nextReviewDate: string;
  learningLevel: number;
  createdAt: string;
}

interface WordContextType {
  words: Word[];
  isGenerating: boolean;
  addWord: (word: string, meaning: string, language?: string) => Promise<void>;
  deleteWord: (id: string) => void;
  getDueWords: () => Word[];
  reviewWord: (id: string, knew: boolean) => void;
}

const WordContext = createContext<WordContextType | null>(null);

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function calcNextReview(word: Word, knew: boolean): Partial<Word> {
  let { easeFactor, intervalDays } = word;
  if (knew) {
    if (intervalDays === 0) intervalDays = 1;
    else if (intervalDays === 1) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * easeFactor);
    easeFactor = Math.min(2.5, easeFactor + 0.1);
  } else {
    intervalDays = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  }
  return {
    easeFactor: Math.round(easeFactor * 100) / 100,
    intervalDays,
    nextReviewDate: addDays(intervalDays),
    learningLevel: knew
      ? Math.min(5, word.learningLevel + 1)
      : Math.max(0, word.learningLevel - 1),
  };
}

// Simulates AI sentence generation — replace with real API call later
async function generateSentence(word: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 1200));
  const templates = [
    `She encountered the word "${word}" while reading a novel.`,
    `Understanding "${word}" helped him communicate more effectively.`,
    `The teacher explained what "${word}" means with a real-life example.`,
    `Learning "${word}" opened new doors in her vocabulary.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

export function WordProvider({ children }: { children: React.ReactNode }) {
  const [words, setWords] = useState<Word[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const addWord = useCallback(async (word: string, meaning: string, language = 'en-US') => {
    setIsGenerating(true);
    const sentence = await generateSentence(word);
    setIsGenerating(false);
    const newWord: Word = {
      id: Date.now().toString(),
      word: word.trim(),
      meaning: meaning.trim(),
      exampleSentence: sentence,
      language,
      easeFactor: 2.5,
      intervalDays: 0,
      nextReviewDate: todayISO(),
      learningLevel: 0,
      createdAt: new Date().toISOString(),
    };
    setWords((prev) => [newWord, ...prev]);
  }, []);

  const deleteWord = useCallback((id: string) => {
    setWords((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const getDueWords = useCallback((): Word[] => {
    const today = todayISO();
    return words.filter((w) => w.nextReviewDate <= today);
  }, [words]);

  const reviewWord = useCallback((id: string, knew: boolean) => {
    setWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...calcNextReview(w, knew) } : w))
    );
  }, []);

  return (
    <WordContext.Provider value={{ words, isGenerating, addWord, deleteWord, getDueWords, reviewWord }}>
      {children}
    </WordContext.Provider>
  );
}

export function useWords() {
  const ctx = useContext(WordContext);
  if (!ctx) throw new Error('useWords must be used within WordProvider');
  return ctx;
}
