import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { submitReview } from '../store/reviewSlice';
import { fetchDueWords, updateWordInList } from '../store/wordSlice';
import { useEffect } from 'react';

export function useReview() {
  const dispatch = useDispatch<AppDispatch>();
  const { dueWords } = useSelector((s: RootState) => s.words);
  const { loading } = useSelector((s: RootState) => s.reviews);

  useEffect(() => {
    dispatch(fetchDueWords());
  }, [dispatch]);

  const review = async (wordId: string, knewIt: boolean) => {
    const result = await dispatch(submitReview({ word_id: wordId, knew_it: knewIt }));
    if (submitReview.fulfilled.match(result)) {
      dispatch(fetchDueWords());
    }
  };

  return { dueWords, loading, review };
}
