import api from './client';

export interface ApiWordList {
  id: string;
  name: string;
  description: string;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export async function fetchLists(): Promise<ApiWordList[]> {
  const { data } = await api.get('/lists/');
  return data.items;
}

export async function createListApi(name: string): Promise<ApiWordList> {
  const { data } = await api.post('/lists/', { name, description: '' });
  return data;
}

export async function deleteListApi(id: string): Promise<void> {
  await api.delete(`/lists/${id}`);
}
