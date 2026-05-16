import { configureStore } from '@reduxjs/toolkit';
import wordReducer from './wordSlice';
import reviewReducer from './reviewSlice';

export const store = configureStore({
  reducer: {
    words: wordReducer,
    reviews: reviewReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
