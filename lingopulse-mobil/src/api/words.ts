import api from './client';

export interface ApiWord {
  id: string;
  list_id: string | null;
  word: string;
  meaning: string;
  learning_level: number;
  ease_factor: number;
  interval_days: number;
  next_review_date: string;
  created_at: string;
  updated_at: string;
}

export async function fetchWords(listId: string): Promise<ApiWord[]> {
  const { data } = await api.get('/words/', { params: { list_id: listId, size: 100 } });
  return data.items;
}

export async function fetchDueWords(limit = 20): Promise<ApiWord[]> {
  const { data } = await api.get('/words/due', { params: { limit } });
  return data;
}

export async function createWordApi(
  word: string,
  meaning: string,
  listId: string,
): Promise<ApiWord> {
  const { data } = await api.post('/words/', { word, meaning, list_id: listId });
  return data;
}

export async function deleteWordApi(id: string): Promise<void> {
  await api.delete(`/words/${id}`);
}

export async function fetchAllWords(): Promise<ApiWord[]> {
  const { data } = await api.get('/words/', { params: { size: 200 } });
  return data.items;
}

export async function submitReviewApi(wordId: string, knewIt: boolean): Promise<void> {
  await api.post('/reviews/', { word_id: wordId, knew_it: knewIt });
}
