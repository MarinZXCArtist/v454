import React, { useState } from 'react';
import { Camera, Heart, Calendar, Trash2, Maximize2, Tag, Plus, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { PhotoItem } from '../types';
import { likePhotoInFirebase, deletePhotoFromFirebase } from '../lib/firebase';

interface PhotoGalleryProps {
  photos: PhotoItem[];
  isAdmin: boolean;
  onOpenAddModal: () => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, isAdmin, onOpenAddModal }) => {
  const [activeCategory, setActiveCategory] = useState<string>('Все моменты');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  const categories = ['Все моменты', 'Свидания', 'Путешествия', 'Милости'];

  const filteredPhotos = activeCategory === 'Все моменты'
    ? photos
    : photos.filter((p) => p.category === activeCategory);

  // Sort photos from newest to oldest (newest first)
  const sortedPhotos = [...filteredPhotos].sort((a, b) => {
    // 1. Compare by createdAt timestamp if available
    const timeA = a.createdAt || 0;
    const timeB = b.createdAt || 0;
    if (timeA !== timeB) return timeB - timeA;

    // 2. Fallback comparison by date string parsing if available (e.g. DD.MM.YYYY or YYYY-MM-DD)
    if (a.date && b.date) {
      const parseDate = (dStr: string) => {
        const parts = dStr.split('.');
        if (parts.length === 3) {
          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
        }
        return new Date(dStr).getTime() || 0;
      };
      return parseDate(b.date) - parseDate(a.date);
    }

    return 0;
  });

  const handleLike = async (e: React.MouseEvent, photoId: string) => {
    e.stopPropagation();

    // Trigger confetti burst on photo click
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x, y },
      colors: ['#f43f5e', '#ec4899', '#fb7185']
    });

    await likePhotoInFirebase(photoId);
  };

  const handleDelete = async (e: React.MouseEvent, photoId: string) => {
    e.stopPropagation();
    if (selectedPhoto?.id === photoId) {
      setSelectedPhoto(null);
    }
    await deletePhotoFromFirebase(photoId);
  };

  return (
    <section className="w-full mt-12 mb-16">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-md">
              <Camera className="w-4 h-4" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-sans tracking-tight">
              Наши Совместные Моменты • Мы
            </h2>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            Наши моменты, пусть будут здесь, чтобы никогда не теряться во времени...
          </p>
        </div>

        {/* Add Photo Button (Always visible if Admin, or small quick link) */}
        {isAdmin && (
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Загрузить Фото</span>
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-white text-slate-600 hover:bg-rose-50 border border-rose-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Photos Grid */}
      {sortedPhotos.length === 0 ? (
        <div className="w-full bg-white rounded-3xl p-12 text-center border border-rose-100 romantic-card-shadow">
          <Camera className="w-12 h-12 text-rose-300 mx-auto mb-3 animate-bounce" />
          <h3 className="text-lg font-bold text-slate-700 mb-1">
            Здесь пока нет фотографий
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            {isAdmin
              ? 'Нажми "Загрузить Фото", чтобы добавить первый снимок!'
              : 'Введи код админа (525252), чтобы добавить новые снимки.'}
          </p>
          {isAdmin && (
            <button
              onClick={onOpenAddModal}
              className="px-5 py-2.5 bg-rose-500 text-white font-bold rounded-2xl text-sm hover:bg-rose-600 transition-colors cursor-pointer"
            >
              Загрузить первое фото
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedPhotos.map((photo) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative bg-white rounded-3xl overflow-hidden border border-rose-100 romantic-card-shadow hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* Image Box */}
              <div className="relative aspect-4/3 w-full bg-rose-50 overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Category Badge Overlay */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-rose-600 border border-rose-100 shadow-2xs">
                  {photo.category}
                </div>

                {/* Lightbox Icon Hover Overlay */}
                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/90 text-rose-600 flex items-center justify-center shadow-lg">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>

                {/* Delete button for Admin */}
                {isAdmin && (
                  <button
                    onClick={(e) => handleDelete(e, photo.id)}
                    title="Удалить фото"
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md hover:bg-rose-700 transition-colors z-20 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Card Footer Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-base mb-1 line-clamp-2">
                    {photo.title}
                  </h4>
                  {photo.date && (
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" />
                      <span>{photo.date}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-rose-50 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium font-handwriting text-sm">
                    Марин ♥ Диана
                  </span>
                  <div className="text-rose-400">
                    <Heart className="w-4 h-4 fill-rose-400" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <div
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-rose-200"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="max-h-[80vh] overflow-hidden bg-slate-950 flex items-center justify-center">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  className="max-h-[75vh] w-auto object-contain"
                />
              </div>

              <div className="p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-block text-xs font-bold text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 mb-1">
                    {selectedPhoto.category}
                  </span>
                  <h3 className="text-xl font-bold text-slate-800">
                    {selectedPhoto.title}
                  </h3>
                  {selectedPhoto.date && (
                    <p className="text-xs text-slate-400 font-medium">
                      Дата снимка: {selectedPhoto.date}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <button
                      onClick={(e) => handleDelete(e, selectedPhoto.id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-full shadow-xs transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Удалить</span>
                    </button>
                  )}
                  <div className="flex items-center gap-1.5 text-rose-500 font-bold text-sm bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
                    <Heart className="w-4 h-4 fill-rose-500" />
                    <span>Марин ♥ Диана</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
