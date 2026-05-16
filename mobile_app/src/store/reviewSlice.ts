import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewsApi } from '../api/reviews';
import type { ReviewResponse, ReviewSubmit } from '../types/review';

interface ReviewState {
  lastReview: ReviewResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  lastReview: null,
  loading: false,
  error: null,
};

export const submitReview = createAsyncThunk(
  'reviews/submit',
  (data: ReviewSubmit) => reviewsApi.submit(data),
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitReview.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(submitReview.fulfilled, (s, a) => {
        s.loading = false;
        s.lastReview = a.payload;
      })
      .addCase(submitReview.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message ?? 'Error';
      });
  },
});

export default reviewSlice.reducer;
