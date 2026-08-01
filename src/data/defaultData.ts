import { PhotoItem, QuoteItem, SongSettings } from '../types';

export const DEFAULT_PHOTOS: PhotoItem[] = [
  {
    id: 'def-1',
    url: 'https://bigfoto.name/uploads/posts/2022-03/1647521419_1-bigfoto-name-p-loading-1.png',
    title: 'Фотки грузятся любимая, подожди секунду',
    date: '14.07.2024',
    category: 'Свидания',
    createdAt: Date.now() - 800000,
    likes: 12
  },
  {
    id: 'def-2',
    url: 'https://bigfoto.name/uploads/posts/2022-03/1647521419_1-bigfoto-name-p-loading-1.png',
    title: 'Фотки грузятся любимая, подожди секунду',
    date: '01.09.2024',
    category: 'Милости',
    createdAt: Date.now() - 700000,
    likes: 19
  },
  {
    id: 'def-3',
    url: 'https://bigfoto.name/uploads/posts/2022-03/1647521419_1-bigfoto-name-p-loading-1.png',
    title: 'Фотки грузятся любимая, подожди секунду',
    date: '15.10.2024',
    category: 'Путешествия',
    createdAt: Date.now() - 600000,
    likes: 24
  },
  {
    id: 'def-4',
    url: 'https://bigfoto.name/uploads/posts/2022-03/1647521419_1-bigfoto-name-p-loading-1.png',
    title: 'Фотки грузятся любимая, подожди секунду',
    date: '31.12.2024',
    category: 'Любимые',
    createdAt: Date.now() - 500000,
    likes: 31
  }
];

export const DEFAULT_QUOTES: QuoteItem[] = [
  {
    id: 'q-1',
    text: 'Помнишь, как мы смеялись ни о чём? В такие моменты я понимаю, что ты — моя родная душа и моё вечное счастье.',
    author: 'Марин для Дианы',
    createdAt: Date.now()
  },
  {
    id: 'q-2',
    text: 'Ты делаешь каждый мой день ярче и теплее. Спасибо за твою невероятную нежность и доброту.',
    author: 'Марин',
    createdAt: Date.now() - 10000
  },
  {
    id: 'q-3',
    text: 'Каждая секунда рядом с тобой — это маленькое путешествие в сказку, из которой никогда не хочется возвращаться.',
    author: 'С любовью',
    createdAt: Date.now() - 20000
  }
];

export const DEFAULT_SONG: SongSettings = {
  title: 'Тает дым',
  artist: 'Макс Корж',
  audioUrl: '/song.mp3'
};
