import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { fetchLists, createListApi, deleteListApi, type ApiWordList } from '../api/lists';
import {
  fetchWords,
  fetchAllWords,
  createWordApi,
  deleteWordApi,
  type ApiWord,
} from '../api/words';

export interface WordList {
  id: string;
  name: string;
  description: string;
  wordCount: number;
  createdAt: string;
}

export interface Word {
  id: string;
  listId: string;
  word: string;
  meaning: string;
  language: string;
  easeFactor: number;
  intervalDays: number;
  nextReviewDate: string;
  learningLevel: number;
  createdAt: string;
}

interface WordContextType {
  lists: WordList[];
  isLoadingLists: boolean;
  loadLists: () => Promise<void>;
  createList: (name: string) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  getList: (id: string) => WordList | undefined;
  listWords: Record<string, Word[]>;
  isLoadingWords: boolean;
  loadListWords: (listId: string) => Promise<Word[]>;
  getListWords: (listId: string) => Word[];
  addWord: (word: string, meaning: string, listId: string) => Promise<void>;
  deleteWord: (id: string) => Promise<void>;
  loadAllWords: () => Promise<Word[]>;
  reset: () => void;
}

const WordContext = createContext<WordContextType | null>(null);

function mapList(l: ApiWordList): WordList {
  return {
    id: l.id,
    name: l.name,
    description: l.description,
    wordCount: l.word_count,
    createdAt: l.created_at,
  };
}

function mapWord(w: ApiWord): Word {
  return {
    id: w.id,
    listId: w.list_id ?? '',
    word: w.word,
    meaning: w.meaning,
    language: 'en-US',
    easeFactor: w.ease_factor,
    intervalDays: w.interval_days,
    nextReviewDate: w.next_review_date,
    learningLevel: w.learning_level,
    createdAt: w.created_at,
  };
}

export function WordProvider({ children }: { children: React.ReactNode }) {
  const [lists, setLists] = useState<WordList[]>([]);
  const [listWords, setListWords] = useState<Record<string, Word[]>>({});
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isLoadingWords, setIsLoadingWords] = useState(false);

  const loadLists = useCallback(async () => {
    setIsLoadingLists(true);
    try {
      const data = await fetchLists();
      setLists(data.map(mapList));
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status !== 401) {
        Alert.alert('Hata', 'Listeler yüklenirken bir sorun oluştu.');
      }
    } finally {
      setIsLoadingLists(false);
    }
  }, []);

  const createList = useCallback(async (name: string) => {
    const data = await createListApi(name);
    setLists((prev) => [mapList(data), ...prev]);
  }, []);

  const deleteList = useCallback(async (id: string) => {
    await deleteListApi(id);
    setLists((prev) => prev.filter((l) => l.id !== id));
    setListWords((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const getList = useCallback(
    (id: string) => lists.find((l) => l.id === id),
    [lists],
  );

  const loadListWords = useCallback(async (listId: string): Promise<Word[]> => {
    setIsLoadingWords(true);
    try {
      const data = await fetchWords(listId);
      const mapped = data.map(mapWord);
      setListWords((prev) => ({ ...prev, [listId]: mapped }));
      return mapped;
    } catch {
      Alert.alert('Hata', 'Kelimeler yüklenirken bir sorun oluştu.');
      return [];
    } finally {
      setIsLoadingWords(false);
    }
  }, []);

  const getListWords = useCallback(
    (listId: string) => listWords[listId] ?? [],
    [listWords],
  );

  const addWord = useCallback(async (word: string, meaning: string, listId: string) => {
    const data = await createWordApi(word, meaning, listId);
    const newWord = mapWord(data);
    setListWords((prev) => ({
      ...prev,
      [listId]: [newWord, ...(prev[listId] ?? [])],
    }));
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, wordCount: l.wordCount + 1 } : l)),
    );
  }, []);

  const deleteWord = useCallback(async (id: string) => {
    try {
      let wordListId: string | undefined;
      setListWords((prev) => {
        const next = { ...prev };
        for (const lid of Object.keys(next)) {
          const found = next[lid].some((w) => w.id === id);
          if (found) {
            wordListId = lid;
            next[lid] = next[lid].filter((w) => w.id !== id);
          }
        }
        return next;
      });
      await deleteWordApi(id);
      if (wordListId) {
        const wlid = wordListId;
        setLists((prev) =>
          prev.map((l) =>
            l.id === wlid ? { ...l, wordCount: Math.max(0, l.wordCount - 1) } : l,
          ),
        );
      }
    } catch {
      Alert.alert('Hata', 'Kelime silinirken bir sorun oluştu.');
    }
  }, []);

  const loadAllWords = useCallback(async (): Promise<Word[]> => {
    try {
      const data = await fetchAllWords();
      return data.map(mapWord);
    } catch {
      Alert.alert('Hata', 'Kelimeler yüklenirken bir sorun oluştu.');
      return [];
    }
  }, []);

  const reset = useCallback(() => {
    setLists([]);
    setListWords({});
  }, []);

  return (
    <WordContext.Provider
      value={{
        lists,
        isLoadingLists,
        loadLists,
        createList,
        deleteList,
        getList,
        listWords,
        isLoadingWords,
        loadListWords,
        getListWords,
        addWord,
        deleteWord,
        loadAllWords,
        reset,
      }}
    >
      {children}
    </WordContext.Provider>
  );
}

export function useWords() {
  const ctx = useContext(WordContext);
  if (!ctx) throw new Error('useWords must be used within WordProvider');
  return ctx;
}
