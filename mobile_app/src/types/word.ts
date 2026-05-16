export interface Word {
  id: string;
  word: string;
  meaning: string;
  example_sentence: string;
  example_sentence_translation: string;
  learning_level: number;
  ease_factor: number;
  interval_days: number;
  next_review_date: string;
  created_at: string;
  updated_at: string;
}

export interface WordCreate {
  word: string;
  meaning: string;
}

export interface WordUpdate {
  meaning?: string;
  example_sentence?: string;
  example_sentence_translation?: string;
}

export interface WordListResponse {
  items: Word[];
  total: number;
  page: number;
  size: number;
}
