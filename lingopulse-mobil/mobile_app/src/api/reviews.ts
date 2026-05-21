import { apiClient } from './client';
import type { ReviewResponse, ReviewSubmit } from '../types/review';

export const reviewsApi = {
  submit: (data: ReviewSubmit): Promise<ReviewResponse> =>
    apiClient.post('/reviews/', data),
};
