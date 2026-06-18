export interface Milestone {
  id: string;
  date: string;
  title: string;
  description: string;
  emoji: string;
  image?: string;
}

export interface PhotoMemory {
  id: string;
  src: string;
  alt: string;
  date: string;
  caption: string;
  title?: string;
  likes: number;
  scale?: number;
  rotate?: number;
  shiftX?: number;
  shiftY?: number;
  filter?: string;
  cardSize?: 'small' | 'medium' | 'huge';
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  correctExplanation: string;
}

export interface DreamItem {
  id: string;
  title: string;
  category: 'travel' | 'home' | 'activity' | 'general';
  completed: boolean;
  notes?: string;
}

export interface LoveLetter {
  id: string;
  date: string;
  sender: string;
  recipient: string;
  message: string;
  paperType: 'classic' | 'vintage' | 'heart' | 'stars';
}
