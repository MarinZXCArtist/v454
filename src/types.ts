export type PasswordMode = '202917' | '2029' | '525252' | null;

export interface PhotoItem {
  id: string;
  url: string;
  title: string;
  date: string;
  category: 'Свидания' | 'Путешествия' | 'Милости' | 'Любимые' | 'Особенное';
  createdAt: number;
  likes: number;
}

export interface QuoteItem {
  id: string;
  text: string;
  author?: string;
  createdAt: number;
}

export interface SongSettings {
  title: string;
  artist: string;
  audioUrl: string;
}

export interface Milestone {
  id: string;
  title: string;
  targetDays?: number;
  targetYears?: number;
  customDate?: string;
}
