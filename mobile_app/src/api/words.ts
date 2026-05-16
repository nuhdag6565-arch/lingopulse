import { apiClient } from './client';
import type { Word, WordCreate, WordListResponse, WordUpdate } from '../types/word';

export const wordsApi = {
  list: (page = 1, size = 20) =>
    apiClient.get<WordListResponse>(`/words/?page=${page}&size=${size}`),

  getDue: (limit = 20) =>
    apiClient.get<Word[]>(`/words/due?limit=${limit}`),

  getById: (id: string) =>
    apiClient.get<Word>(`/words/${id}`),

  create: (data: WordCreate) =>
    apiClient.post<Word>('/words/', data),

  update: (id: string, data: WordUpdate) =>
    apiClient.patch<Word>(`/words/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/words/${id}`),

  regenerateExample: (id: string) =>
    apiClient.post<Word>(`/words/${id}/regenerate-example`, {}),
};
