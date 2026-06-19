import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PhotoMemory } from '../types';
import { Heart, Plus, Trash2, Camera, Sparkles, X, HeartHandshake, Upload, Sliders, Eye, Pencil, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface PhotoSectionProps {
  photos: PhotoMemory[];
  onAddPhoto: (p: PhotoMemory) => void;
  onDeletePhoto: (id: string) => void;
  onLikePhoto: (id: string) => void;
  isAdmin: boolean;
}

const FILTERS = [
  { name: 'Натуральный', value: 'normal' },
  { name: 'Винтаж Сепия', value: 'sepia(80%)' },
  { name: 'Розовая мечта', value: 'hue-rotate(330deg) saturate(120%)' },
  { name: 'Ретро Ч/Б', value: 'grayscale(100%)' },
  { name: 'Мягкий лофи', value: 'contrast(90%) brightness(110%)' }
];

// Parse "Месяц Год" into sortable number. Newer = higher.
const MONTHS: Record<string, number> = {
  'январь': 1, 'января': 1, 'февраль': 2, 'февраля': 2, 'март': 3, 'марта': 3,
  'апрель': 4, 'апреля': 4, 'май': 5, 'мая': 5, 'июнь': 6, 'июня': 6,
  'июль': 7, 'июля': 7, 'август': 8, 'августа': 8, 'сентябрь': 9, 'сентября': 9,
  'октябрь': 10, 'октября': 10, 'ноябрь': 11, 'ноября': 11, 'декабрь': 12, 'декабря': 12
};

function parseDateScore(date: string): number {
  if (!date) return 0;
  const parts = date.trim().toLowerCase().split(/\s+/);
  if (parts.length >= 2) {
    const month = MONTHS[parts[0]] ?? 0;
    const year = parseInt(parts[1]) || 0;
    if (year > 0) return year * 100 + month;
  }
  return 0;
}

export default function PhotoSection({ photos, onAddPhoto, onDeletePhoto, onLikePhoto, isAdmin }: PhotoSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [uploadedSrc, setUploadedSrc] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newDate, setNewDate] = useState('');
  const [photoScale, setPhotoScale] = useState(1);
  const [photoRotate, setPhotoRotate] = useState(0);
  const [photoShiftX, setPhotoShiftX] = useState(0);
  const [photoShiftY, setPhotoShiftY] = useState(0);
  const [photoFilter, setPhotoFilter] = useState('normal');
  const [photoCardSize, setPhotoCardSize] = useState<'small' | 'medium' | 'huge'>('medium');

  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMemory | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<PhotoMemory | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<PhotoMemory | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editSrc, setEditSrc] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  const loveQuotes = [
    "Помнишь, как мы смеялись ни о чём? В такие моменты я понимаю, что ты — моя родная душа и моё вечное счастье.",
    "Твоя тёплая улыбка — самый светлый и долгожданный момент каждого моего дня. Люблю тебя безумно!",
    "Обещаю согревать твои нежные ладошки в самый холодный зимний вечер и всегда беречь наш уютный мир.",
    "Каждая секунда, проведённая рядом с тобой — это лучшая, самая искренняя глава моей жизни.",
    "Я обожаю твои утренние сонные обнимашки, они дарят невероятное тепло и улыбку на весь день вперёд.",
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showQuoteBubble, setShowQuoteBubble] = useState(true);

  // Sort photos: newest date first, then by id
  const sortedPhotos = [...photos].sort((a, b) => {
    const scoreA = parseDateScore(a.date);
    const scoreB = parseDateScore(b.date);
    if (scoreA !== scoreB) return scoreB - scoreA;
    return b.id.localeCompare(a.id);
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawResult = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 1000;
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
          else { w = Math.round(w * maxDim / h); h = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) { ctx.drawImage(img, 0, 0, w, h); setter(canvas.toDataURL('image/jpeg', 0.75)); }
        else setter(rawResult);
      };
      img.src = rawResult;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaption) return;
    const imgUrl = uploadedSrc || `https://picsum.photos/seed/love-${Date.now()}/600/450`;
    onAddPhoto({
      id: Date.now().toString(), src: imgUrl, alt: newTitle || 'Карточка воспоминания',
      date: newDate || 'Сегодня', title: newTitle || 'Особый момент', caption: newCaption,
      likes: 1, scale: photoScale, rotate: photoRotate, shiftX: photoShiftX,
      shiftY: photoShiftY, filter: photoFilter, cardSize: photoCardSize,
    });
    setUploadedSrc(''); setNewTitle(''); setNewCaption(''); setNewDate('');
    setPhotoScale(1); setPhotoRotate(0); setPhotoShiftX(0); setPhotoShiftY(0);
    setPhotoFilter('normal'); setPhotoCardSize('medium'); setIsAdding(false);
  };

  const openEdit = (photo: PhotoMemory) => {
    setEditingPhoto(photo);
    setEditTitle(photo.title || '');
    setEditCaption(photo.caption);
    setEditDate(photo.date);
    setEditSrc(photo.src);
  };

  const handleSaveEdit = async () => {
    if (!editingPhoto) return;
    const updated = { ...editingPhoto, title: editTitle, caption: editCaption, date: editDate, src: editSrc };
    try {
      await updateDoc(doc(db, 'photos', editingPhoto.id), {
        title: editTitle, caption: editCaption, date: editDate, src: editSrc
      });
    } catch (e) { console.error(e); }
    // update in parent via onLikePhoto trick — instead we'll just reload; for now update local via onAddPhoto pattern
    // Parent will re-fetch from Firestore or we can reload
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Camera className="text-rose-500" size={24} />
            <span>Наши Совместные Моменты • Мы</span>
          </h2>
          <p className="text-gray-500 text-xs">Наши моменты, пусть будут здесь, чтобы никогда не теряться во времени...</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-bold rounded-2xl flex items-center gap-2 text-sm transition-all shadow-md cursor-pointer self-start animate-pulse"
          >
            {isAdding ? <X size={16} /> : <Plus size={16} />}
            <span>{isAdding ? 'Закрыть редактор' : 'Добавить счастливый момент'}</span>
          </button>
        )}
      </div>

      {/* Love quote */}
      <div className="bg-gradient-to-br from-pink-50/70 to-rose-50/70 rounded-3xl p-4 sm:p-5 border border-pink-100 flex items-center gap-4 shadow-sm">
        <button
          onClick={() => { setShowQuoteBubble(false); setTimeout(() => { setQuoteIndex((p) => (p + 1) % loveQuotes.length); setShowQuoteBubble(true); }, 200); }}
          className="w-12 h-12 bg-white hover:bg-rose-50 border border-pink-200 text-rose-500 rounded-2xl shadow-sm flex items-center justify-center cursor-pointer transition-all hover:scale-105 flex-shrink-0"
        >
          <Sparkles className="animate-spin-slow" size={20} />
        </button>
        <div className="flex-1">
          <span className="text-[10px] font-extrabold text-rose-500 uppercase tracking-widest block">♥ Копилка нежных мыслей</span>
          <AnimatePresence mode="wait">
            {showQuoteBubble && (
              <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-xs sm:text-sm text-stone-750 italic font-medium leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                «{loveQuotes[quoteIndex]}»
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {isAdding && isAdmin && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 bg-pink-50/40 rounded-3xl border border-pink-100 grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4">
                <h3 className="font-bold text-rose-600 text-sm flex items-center gap-1.5"><Sliders size={14} /><span>Настройка фотокарточки</span></h3>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-500">Фотография:</label>
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-pink-200 hover:border-rose-400 bg-white p-4 rounded-xl flex flex-col items-center cursor-pointer transition-colors group">
                    <Upload className="text-rose-400 mb-1" size={24} />
                    <span className="text-xs font-bold text-stone-600">Нажмите для выбора файла</span>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, setUploadedSrc)} className="hidden" />
                  </div>
                </div>
                {uploadedSrc && (
                  <div className="p-4 bg-white rounded-2xl border border-pink-100 space-y-3 text-xs text-gray-600">
                    <div><div className="flex justify-between mb-1"><span>🔍 Масштаб:</span><span className="font-mono font-bold text-rose-500">{Math.round(photoScale * 100)}%</span></div>
                      <input type="range" min="0.5" max="2.5" step="0.05" value={photoScale} onChange={(e) => setPhotoScale(parseFloat(e.target.value))} className="w-full h-1 bg-pink-50 accent-rose-400 rounded-full appearance-none cursor-pointer" /></div>
                    <div><div className="flex justify-between mb-1"><span>🔄 Поворот:</span><span className="font-mono font-bold text-rose-500">{photoRotate}°</span></div>
                      <input type="range" min="-180" max="180" value={photoRotate} onChange={(e) => setPhotoRotate(parseInt(e.target.value))} className="w-full h-1 bg-pink-50 accent-rose-400 rounded-full appearance-none cursor-pointer" /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><div className="flex justify-between mb-1 text-[10px]"><span>↔ Сдвиг X:</span><span>{photoShiftX}px</span></div>
                        <input type="range" min="-100" max="100" value={photoShiftX} onChange={(e) => setPhotoShiftX(parseInt(e.target.value))} className="w-full h-1 bg-pink-50 accent-rose-400 rounded-full appearance-none cursor-pointer" /></div>
                      <div><div className="flex justify-between mb-1 text-[10px]"><span>↕ Сдвиг Y:</span><span>{photoShiftY}px</span></div>
                        <input type="range" min="-100" max="100" value={photoShiftY} onChange={(e) => setPhotoShiftY(parseInt(e.target.value))} className="w-full h-1 bg-pink-50 accent-rose-400 rounded-full appearance-none cursor-pointer" /></div>
                    </div>
                    <div><label className="block text-[11px] font-semibold text-gray-500 mb-1">🎭 Фильтр:</label>
                      <div className="flex flex-wrap gap-1">
                        {FILTERS.map((f) => (<button key={f.name} type="button" onClick={() => setPhotoFilter(f.value)} className={`px-2 py-1 text-[10px] font-semibold rounded-lg ${photoFilter === f.value ? 'bg-rose-100 text-rose-600' : 'bg-gray-50 text-stone-500 hover:bg-gray-100'}`}>{f.name}</button>))}
                      </div>
                    </div>
                    <div className="border-t border-pink-50 pt-2 flex items-center justify-between">
                      <span>📏 Размер:</span>
                      <div className="flex gap-1.5">
                        {(['small', 'medium', 'huge'] as const).map((sz) => (<button key={sz} type="button" onClick={() => setPhotoCardSize(sz)} className={`px-2 py-1 text-[9px] font-mono font-bold rounded-lg uppercase ${photoCardSize === sz ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white' : 'bg-gray-100 text-gray-400'}`}>{sz === 'small' ? 'Mini' : sz === 'medium' ? 'Classic' : 'Mega'}</button>))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-3xl border border-pink-50 shadow-sm relative">
                <span className="absolute top-2 left-2 text-[10px] font-mono font-bold text-gray-300 uppercase flex items-center gap-1"><Eye size={10} /><span>Превью</span></span>
                <div className="bg-white p-3 rounded-lg shadow-md border border-gray-150 flex flex-col items-center w-full max-w-[220px]" style={{ transform: 'rotate(-1.5deg)' }}>
                  <div className="w-full aspect-[4/3] bg-neutral-100 overflow-hidden rounded relative border border-gray-200">
                    <img src={uploadedSrc || `https://picsum.photos/seed/love/600/450`} alt="Превью" className="origin-center" style={{ transform: `scale(${photoScale}) rotate(${photoRotate}deg) translate(${photoShiftX}px, ${photoShiftY}px)`, filter: photoFilter, width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="mt-3 w-full text-center">
                    <span className="text-[9px] text-gray-300 font-mono block">📅 {newDate || 'ДАТА'}</span>
                    {newTitle && <h4 className="font-semibold text-xs text-gray-800 truncate mt-0.5">{newTitle}</h4>}
                    <p className="text-[10px] text-gray-500 italic truncate mt-0.5">{newCaption || 'Подпись...'}</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div><label className="block text-xs font-semibold text-gray-500 mb-1">Название момента:</label>
                    <input type="text" required placeholder="Например: Сладкое свидание" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full px-3 py-2 bg-white rounded-xl border border-pink-100 focus:outline-rose-300 text-xs font-semibold" /></div>
                  <div><label className="block text-xs font-semibold text-gray-500 mb-1">Когда это было?</label>
                    <input type="text" placeholder="Например: Август 2025" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full px-3 py-2 bg-white rounded-xl border border-pink-100 focus:outline-rose-300 text-xs" /></div>
                  <div><label className="block text-xs font-semibold text-gray-500 mb-1">Милая подпись:</label>
                    <textarea required placeholder="Напиши самое сокровенное..." value={newCaption} onChange={(e) => setNewCaption(e.target.value)} rows={3} className="w-full px-3 py-2 bg-white rounded-xl border border-pink-100 focus:outline-rose-300 text-xs resize-none" /></div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-2 text-xs font-semibold text-gray-400 cursor-pointer">Отмена</button>
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer">Добавить момент</button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedPhotos.map((item) => {
          const finalSizeStyle = item.cardSize === 'small' ? 'scale-95 text-xs p-3' : item.cardSize === 'huge' ? 'col-span-1 sm:col-span-2 p-5 border-rose-100' : 'p-4';
          return (
            <motion.div key={item.id} layout whileHover={{ scale: 1.025 }} className={`bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col items-center text-center cursor-pointer group transition-all relative select-none ${finalSizeStyle}`} onClick={() => setSelectedPhoto(item)}>
              {/* Admin buttons */}
              {isAdmin && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setPhotoToDelete(item); }} className="absolute top-3 right-3 z-30 bg-rose-500 hover:bg-rose-600 text-white p-1.5 rounded-full shadow-md border border-white transition-all"><X size={12} className="stroke-[3.5]" /></button>
                  <button onClick={(e) => { e.stopPropagation(); openEdit(item); }} className="absolute top-3 left-3 z-30 bg-blue-400 hover:bg-blue-500 text-white p-1.5 rounded-full shadow-md border border-white transition-all"><Pencil size={12} /></button>
                </>
              )}
              <div className="w-full aspect-[4/3] bg-neutral-100 overflow-hidden rounded-xl relative border border-gray-150 shadow-inner">
                <img src={item.src} alt={item.alt} style={{ transform: `scale(${item.scale || 1.05}) rotate(${item.rotate || 0}deg) translate(${item.shiftX || 0}px, ${item.shiftY || 0}px)`, filter: item.filter || 'normal', width: '100%', height: '100%', objectFit: 'cover' }} className="transition-transform duration-500 group-hover:brightness-105" />
                <div className="absolute inset-0 bg-rose-900/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <HeartHandshake className="text-white drop-shadow-md animate-bounce" size={36} />
                </div>
              </div>
              <div className="mt-4 w-full flex-1 flex flex-col justify-between pb-2">
                <div>
                  <div className="inline-flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full mb-1.5">
                    <span className="text-[10px] text-rose-500 font-extrabold">📅 {item.date}</span>
                  </div>
                  {item.title && <h4 className="font-sans text-[13.5px] font-extrabold text-stone-900 tracking-tight leading-snug break-words px-2 mb-1.5">{item.title}</h4>}
                  <p className="font-sans text-xs text-stone-750 px-2.5 font-normal leading-relaxed break-words">{item.caption}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox — rendered via portal directly into document.body so it's always centered on screen, not affected by page scroll/layout */}
      {selectedPhoto && createPortal(
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedPhoto(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white p-6 rounded-3xl max-w-2xl w-full flex flex-col items-center relative shadow-2xl border border-pink-100 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedPhoto(null)} className="absolute top-4 right-4 bg-rose-500 hover:bg-rose-600 text-white p-2.5 rounded-full shadow-lg border-2 border-white z-50 cursor-pointer"><X size={18} className="stroke-[3.5]" /></button>
              <div className="w-full rounded-2xl overflow-hidden shadow-inner max-h-[55vh] flex items-center justify-center bg-zinc-50 border border-gray-150">
                <img src={selectedPhoto.src} alt={selectedPhoto.alt} style={{ transform: `scale(${selectedPhoto.scale || 1}) rotate(${selectedPhoto.rotate || 0}deg) translate(${selectedPhoto.shiftX || 0}px, ${selectedPhoto.shiftY || 0}px)`, filter: selectedPhoto.filter || 'normal', width: '100%', maxHeight: '55vh', objectFit: 'contain' }} />
              </div>
              <div className="mt-5 w-full text-center pb-2">
                <div className="inline-flex items-center gap-1 bg-rose-50 px-3 py-1 rounded-full mb-2.5">
                  <span className="text-xs text-rose-600 font-extrabold">📅 {selectedPhoto.date}</span>
                </div>
                {selectedPhoto.title && <h3 className="text-lg font-extrabold text-stone-900 mt-1 mb-2">{selectedPhoto.title}</h3>}
                <p className="text-sm text-stone-700 leading-relaxed px-6">{selectedPhoto.caption}</p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      {/* Edit modal */}
      {editingPhoto && createPortal(
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={() => setEditingPhoto(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white p-6 rounded-3xl max-w-md w-full relative shadow-2xl border border-pink-100 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setEditingPhoto(null)} className="absolute top-4 right-4 bg-rose-500 text-white p-2 rounded-full"><X size={16} /></button>
              <h3 className="text-base font-extrabold text-stone-900">✏️ Редактировать момент</h3>
              <div className="space-y-3">
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">Название:</label>
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-2 bg-rose-50 rounded-xl border border-pink-100 text-xs font-semibold focus:outline-rose-300" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">Дата:</label>
                  <input type="text" value={editDate} onChange={(e) => setEditDate(e.target.value)} placeholder="Например: Август 2025" className="w-full px-3 py-2 bg-rose-50 rounded-xl border border-pink-100 text-xs focus:outline-rose-300" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">Подпись:</label>
                  <textarea value={editCaption} onChange={(e) => setEditCaption(e.target.value)} rows={3} className="w-full px-3 py-2 bg-rose-50 rounded-xl border border-pink-100 text-xs resize-none focus:outline-rose-300" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">Заменить фото:</label>
                  <div onClick={() => editFileInputRef.current?.click()} className="border-2 border-dashed border-pink-200 hover:border-rose-400 bg-white p-3 rounded-xl flex flex-col items-center cursor-pointer">
                    <Upload className="text-rose-400 mb-1" size={20} />
                    <span className="text-xs text-stone-600">{editSrc !== editingPhoto.src ? '✅ Новое фото выбрано' : 'Нажмите для замены фото'}</span>
                    <input ref={editFileInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, setEditSrc)} className="hidden" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditingPhoto(null)} className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl cursor-pointer">Отмена</button>
                <button onClick={handleSaveEdit} className="flex-1 py-2.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1 cursor-pointer"><Check size={14} /> Сохранить</button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      {/* Delete confirmation */}
      {photoToDelete && createPortal(
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setPhotoToDelete(null)}>
            <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }} className="bg-white p-6 rounded-3xl max-w-md w-full text-center relative shadow-2xl border border-pink-100 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 animate-pulse"><Heart size={28} className="fill-rose-300" /></div>
              <h3 className="text-base font-extrabold text-stone-900">Сохранено в памяти сердца 💕</h3>
              <p className="text-xs text-stone-600 leading-relaxed px-2">«Даже если ты удаляешь эту карточку, наши воспоминания останутся навечно гореть тёплым огоньком в памяти 💕🔒»</p>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setPhotoToDelete(null)} className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl cursor-pointer">Оставить в альбоме</button>
                <button onClick={() => { onDeletePhoto(photoToDelete.id); setPhotoToDelete(null); }} className="flex-1 py-2.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-xs font-bold rounded-xl shadow-md active:scale-95 cursor-pointer">Всё равно стереть</button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
