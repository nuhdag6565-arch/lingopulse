import { apiClient } from './client';
import type { Word, WordCreate, WordListResponse, WordUpdate } from '../types/word';

export const wordsApi = {
  list: (page = 1, size = 20): Promise<WordListResponse> =>
    apiClient.get(`/words/?page=${page}&size=${size}`),

  getDue: (limit = 20): Promise<Word[]> =>
    apiClient.get(`/words/due?limit=${limit}`),

  getById: (id: string): Promise<Word> =>
    apiClient.get(`/words/${id}`),

  create: (data: WordCreate): Promise<Word> =>
    apiClient.post('/words/', data),

  update: (id: string, data: WordUpdate): Promise<Word> =>
    apiClient.patch(`/words/${id}`, data),

  delete: (id: string): Promise<void> =>
    apiClient.del(`/words/${id}`),

  regenerateExample: (id: string): Promise<Word> =>
    apiClient.post(`/words/${id}/regenerate-example`, {}),
};
