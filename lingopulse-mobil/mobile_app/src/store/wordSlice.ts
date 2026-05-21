import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { wordsApi } from '../api/words';
import type { Word, WordCreate } from '../types/word';

interface WordState {
  items: Word[];
  dueWords: Word[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: WordState = {
  items: [],
  dueWords: [],
  total: 0,
  loading: false,
  error: null,
};

export const fetchWords = createAsyncThunk('words/fetchAll', () =>
  wordsApi.list(),
);

export const fetchDueWords = createAsyncThunk('words/fetchDue', () =>
  wordsApi.getDue(),
);

export const addWord = createAsyncThunk('words/add', (data: WordCreate) =>
  wordsApi.create(data),
);

export const removeWord = createAsyncThunk('words/remove', (id: string) =>
  wordsApi.delete(id).then(() => id),
);

const wordSlice = createSlice({
  name: 'words',
  initialState,
  reducers: {
    updateWordInList(state, action: PayloadAction<Word>) {
      const idx = state.items.findIndex((w) => w.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
      const dueIdx = state.dueWords.findIndex((w) => w.id === action.payload.id);
      if (dueIdx !== -1) state.dueWords.splice(dueIdx, 1);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWords.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchWords.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.items;
        s.total = a.payload.total;
      })
      .addCase(fetchWords.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message ?? 'Error';
      })
      .addCase(fetchDueWords.fulfilled, (s, a) => { s.dueWords = a.payload; })
      .addCase(addWord.fulfilled, (s, a) => { s.items.unshift(a.payload); s.total += 1; })
      .addCase(removeWord.fulfilled, (s, a) => {
        s.items = s.items.filter((w) => w.id !== a.payload);
        s.total -= 1;
      });
  },
});

export const { updateWordInList } = wordSlice.actions;
export default wordSlice.reducer;
