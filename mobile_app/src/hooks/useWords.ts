import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchWords, addWord, removeWord } from '../store/wordSlice';
import type { WordCreate } from '../types/word';

export function useWords() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, total, loading, error } = useSelector((s: RootState) => s.words);

  useEffect(() => {
    dispatch(fetchWords());
  }, [dispatch]);

  return {
    words: items,
    total,
    loading,
    error,
    createWord: (data: WordCreate) => dispatch(addWord(data)),
    deleteWord: (id: string) => dispatch(removeWord(id)),
    refresh: () => dispatch(fetchWords()),
  };
}
