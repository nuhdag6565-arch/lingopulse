import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { fetchLists, createListApi, deleteListApi, type ApiWordList } from '../api/lists';
import {
  fetchWords,
  fetchDueWords,
  fetchAllWords,
  createWordApi,
  deleteWordApi,
  submitReviewApi,
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
  loadListWords: (listId: string) => Promise<void>;
  getListWords: (listId: string) => Word[];
  addWord: (word: string, meaning: string, listId: string) => Promise<void>;
  deleteWord: (id: string) => Promise<void>;
  dueWords: Word[];
  isLoadingDue: boolean;
  loadDueWords: () => Promise<Word[]>;
  loadAllWords: () => Promise<Word[]>;
  reviewWord: (id: string, knew: boolean) => Promise<void>;
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
  const [dueWords, setDueWords] = useState<Word[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isLoadingWords, setIsLoadingWords] = useState(false);
  const [isLoadingDue, setIsLoadingDue] = useState(false);

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
    setDueWords((prev) => prev.filter((w) => w.listId !== id));
  }, []);

  const getList = useCallback(
    (id: string) => lists.find((l) => l.id === id),
    [lists],
  );

  const loadListWords = useCallback(async (listId: string) => {
    setIsLoadingWords(true);
    try {
      const data = await fetchWords(listId);
      setListWords((prev) => ({ ...prev, [listId]: data.map(mapWord) }));
    } catch {
      Alert.alert('Hata', 'Kelimeler yüklenirken bir sorun oluştu.');
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
      // Reload the list to restore accurate state
    }
  }, []);

  const loadDueWords = useCallback(async (): Promise<Word[]> => {
    setIsLoadingDue(true);
    try {
      const data = await fetchDueWords();
      const mapped = data.map(mapWord);
      setDueWords(mapped);
      return mapped;
    } catch {
      Alert.alert('Hata', 'Tekrar edilecek kelimeler yüklenemedi.');
      return [];
    } finally {
      setIsLoadingDue(false);
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

  const reviewWord = useCallback(async (id: string, knew: boolean) => {
    await submitReviewApi(id, knew);
    setDueWords((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const reset = useCallback(() => {
    setLists([]);
    setListWords({});
    setDueWords([]);
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
        dueWords,
        isLoadingDue,
        loadDueWords,
        loadAllWords,
        reviewWord,
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
