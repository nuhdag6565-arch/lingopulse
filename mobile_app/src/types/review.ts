export interface ReviewSubmit {
  word_id: string;
  knew_it: boolean;
}

export interface ReviewResponse {
  id: string;
  word_id: string;
  knew_it: boolean;
  previous_level: number;
  new_level: number;
  previous_interval_days: number;
  new_interval_days: number;
  reviewed_at: string;
}
