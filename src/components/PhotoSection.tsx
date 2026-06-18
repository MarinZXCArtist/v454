import React, { useState, useRef } from 'react';
import { PhotoMemory } from '../types';
import { Heart, Plus, Trash2, Camera, Sparkles, X, HeartHandshake, Upload, RotateCw, AlignCenter, Sliders, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PhotoSectionProps {
  photos: PhotoMemory[];
  onAddPhoto: (p: PhotoMemory) => void;
  onDeletePhoto: (id: string) => void;
  onLikePhoto: (id: string) => void;
}

const FILTERS = [
  { name: 'Натуральный', value: 'normal' },
  { name: 'Винтаж Сепия', value: 'sepia(80%)' },
  { name: 'Розовая мечта', value: 'hue-rotate(330deg) saturate(120%)' },
  { name: 'Ретро Ч/Б', value: 'grayscale(100%)' },
  { name: 'Мягкий лофи', value: 'contrast(90%) brightness(110%)' }
];

export default function PhotoSection({ photos, onAddPhoto, onDeletePhoto, onLikePhoto }: PhotoSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [uploadedSrc, setUploadedSrc] = useState<string>('');
  const [newTitle, setNewTitle] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newDate, setNewDate] = useState('');

  // Interactive resize and customize settings
  const [photoScale, setPhotoScale] = useState<number>(1);
  const [photoRotate, setPhotoRotate] = useState<number>(0);
  const [photoShiftX, setPhotoShiftX] = useState<number>(0);
  const [photoShiftY, setPhotoShiftY] = useState<number>(0);
  const [photoFilter, setPhotoFilter] = useState<string>('normal');
  const [photoCardSize, setPhotoCardSize] = useState<'small' | 'medium' | 'huge'>('medium');

  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMemory | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // States for right-click context menu and custom emotional delete reassurance modal
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; photoId: string } | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<PhotoMemory | null>(null);

  // Sweet message jar generator states
  const loveQuotes = [
    "Помнишь, как мы смеялись ни о чём? В такие моменты я понимаю, что ты — моя родная душа и моё вечное счастье.",
    "Твоя тёплая улыбка — самый светлый и долгожданный момент каждого моего дня. Люблю тебя безумно!",
    "Обещаю согревать твои нежные ладошки в самый холодный зимний вечер и всегда беречь наш уютный мир.",
    "Каждая секунда, проведённая рядом с тобой — это лучшая, самая искренняя глава моей жизни.",
    "Я обожаю твои утренние сонные обнимашки, они дарят невероятное тепло и улыбку на весь день вперёд.",
    "С каждым твоим утренним сообщением моё сердце делает маленький радостный кувырок от счастья!",
    "Твоя забота и нежность делают меня самым счастливым человеком во Вселенной. Спасибо за каждый миг вместе.",
    "А ведь между морем и горами я выбираю море не просто так — там по факту всё у нас и началось...",
    "Если весь мир отвернётся от тебя, я пойду к каждому из них и силой поверну его обратно к тебе.",
    "Я готов сразиться с самим собой каждый день, лишь бы ты была по-настоящему счастлива.",
    "Твоя улыбка — моя главная и самая сильная мотивация."
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showQuoteBubble, setShowQuoteBubble] = useState(true);

  // File loading handler with automatic client-side photo compression to ensure offline/local storage loads fast and never crashes limits
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawResult = event.target?.result as string;
        
        const img = new Image();
        img.onload = () => {
          // Set maximum dimension to 1000px so details look extremely polished but sizes are tiny
          const maxDim = 1000;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress image to JPEG at 0.75 quality (sizes generally drop to 60KB-120KB per photo!)
            const compressed = canvas.toDataURL('image/jpeg', 0.75);
            setUploadedSrc(compressed);
          } else {
            setUploadedSrc(rawResult);
          }
        };
        img.src = rawResult;

        // Reset controls for new image
        setPhotoScale(1.0);
        setPhotoRotate(0);
        setPhotoShiftX(0);
        setPhotoShiftY(0);
        setPhotoFilter('normal');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaption) return;

    // Default illustration fallback if no custom upload is selected
    const imgUrl = uploadedSrc || `https://picsum.photos/seed/love-${Date.now()}/600/450`;

    onAddPhoto({
      id: Date.now().toString(),
      src: imgUrl,
      alt: newTitle || 'Карточка воспоминания',
      date: newDate || 'Сегодня',
      title: newTitle || 'Особый момент',
      caption: newCaption,
      likes: 1,
      scale: photoScale,
      rotate: photoRotate,
      shiftX: photoShiftX,
      shiftY: photoShiftY,
      filter: photoFilter,
      cardSize: photoCardSize,
    });

    // Reset fields
    setUploadedSrc('');
    setNewTitle('');
    setNewCaption('');
    setNewDate('');
    setPhotoScale(1);
    setPhotoRotate(0);
    setPhotoShiftX(0);
    setPhotoShiftY(0);
    setPhotoFilter('normal');
    setPhotoCardSize('medium');
    setIsAdding(false);
  };

  return (
    <div id="photo-section" className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Camera className="text-rose-500" size={24} />
            <span>Наши Совместные Моменты • Мы</span>
          </h2>
          <p className="text-gray-500 text-xs">Наши моменты, пусть будут здесь, чтобы никогда не теряться во времени... Каждый миг с тобой бесконечно важен</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-bold rounded-2xl flex items-center gap-2 text-sm transition-all shadow-md cursor-pointer self-start animate-pulse"
          id="add-photo-toggle"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
          <span>{isAdding ? 'Закрыть редактор' : 'Добавить счастливый момент'}</span>
        </button>
      </div>

      {/* Копилка нежных мыслей и признаний */}
      <div className="bg-gradient-to-br from-pink-50/70 to-rose-50/70 rounded-3xl p-4 sm:p-5 border border-pink-100 flex flex-col md:flex-row items-center gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-200/10 rounded-full blur-2xl" />
        <div className="flex-shrink-0 relative">
          <button
            onClick={() => {
              setShowQuoteBubble(false);
              setTimeout(() => {
                setQuoteIndex((prev) => (prev + 1) % loveQuotes.length);
                setShowQuoteBubble(true);
              }, 200);
            }}
            className="w-12 h-12 bg-white hover:bg-rose-50 border border-pink-200 text-rose-500 hover:text-rose-600 rounded-2xl shadow-sm flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
            title="Открыть нежное послание"
          >
            <Sparkles className="animate-spin-slow" size={20} />
          </button>
        </div>
        <div className="flex-1 space-y-1 text-center md:text-left">
          <span className="text-[10px] font-extrabold text-rose-500 uppercase tracking-widest block">♥ Копилка нежных мыслей</span>
          <AnimatePresence mode="wait">
            {showQuoteBubble && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs sm:text-sm text-stone-750 italic font-medium leading-relaxed"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                «{loveQuotes[quoteIndex]}»
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Upload/Add Form with Scale and Crop Editor */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleSubmit}
              className="p-6 bg-pink-50/40 rounded-3xl border border-pink-100 grid grid-cols-1 lg:grid-cols-12 gap-6"
              id="photo-add-form"
            >
              {/* Photo Input & Preview controls */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="font-bold text-rose-600 text-sm flex items-center gap-1.5">
                  <Sliders size={14} className="animate-spin-slow" />
                  <span>Настройка фотокарточки</span>
                </h3>

                {/* File picker button selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-500">Фотография с компьютера:</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-pink-200 hover:border-rose-400 bg-white p-4 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
                  >
                    <Upload className="text-rose-400 group-hover:scale-110 transition-transform mb-1" size={24} />
                    <span className="text-xs font-bold text-stone-600">Нажмите для выбора файла</span>
                    <span className="text-[10px] text-gray-400 mt-1">Поддерживает JPG, PNG, GIF, HEIC</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Scaling, Rotations and shift controllers */}
                {uploadedSrc && (
                  <div className="p-4 bg-white rounded-2xl border border-pink-100 space-y-3.5 text-xs text-gray-600">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>🔍 Масштаб (ресайз):</span>
                        <span className="font-mono font-bold text-rose-500">{Math.round(photoScale * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.05"
                        value={photoScale}
                        onChange={(e) => setPhotoScale(parseFloat(e.target.value))}
                        className="w-full h-1 bg-pink-50 accent-rose-400 rounded-full appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>🔄 Поворот изображения:</span>
                        <span className="font-mono font-bold text-rose-500">{photoRotate}°</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={photoRotate}
                        onChange={(e) => setPhotoRotate(parseInt(e.target.value))}
                        className="w-full h-1 bg-pink-50 accent-rose-400 rounded-full appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex justify-between mb-1 text-[10px]">
                          <span>↔ Сдвиг X:</span>
                          <span>{photoShiftX}px</span>
                        </div>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={photoShiftX}
                          onChange={(e) => setPhotoShiftX(parseInt(e.target.value))}
                          className="w-full h-1 bg-pink-50 accent-rose-400 rounded-full appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1 text-[10px]">
                          <span>↕ Сдвиг Y:</span>
                          <span>{photoShiftY}px</span>
                        </div>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={photoShiftY}
                          onChange={(e) => setPhotoShiftY(parseInt(e.target.value))}
                          className="w-full h-1 bg-pink-50 accent-rose-400 rounded-full appearance-none cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1">🎭 Фильтр:</label>
                      <div className="flex flex-wrap gap-1">
                        {FILTERS.map((f) => (
                          <button
                            key={f.name}
                            type="button"
                            onClick={() => setPhotoFilter(f.value)}
                            className={`px-2 py-1 text-[10px] font-semibold rounded-lg ${photoFilter === f.value ? 'bg-rose-100 text-rose-600 font-bold' : 'bg-gray-50 text-stone-500 hover:bg-gray-100'}`}
                          >
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-pink-50 pt-2 flex items-center justify-between">
                      <span className="font-semibold text-gray-500">📏 Размер рамки:</span>
                      <div className="flex gap-1.5">
                        {(['small', 'medium', 'huge'] as const).map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setPhotoCardSize(sz)}
                            className={`px-2 py-1 text-[9px] font-mono tracking-wider font-bold rounded-lg uppercase ${photoCardSize === sz ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-150'}`}
                          >
                            {sz === 'small' ? 'Mini' : sz === 'medium' ? 'Classic' : 'Mega'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Real-time preview panel */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-3xl border border-pink-50 shadow-sm relative">
                <span className="absolute top-2 left-2 text-[10px] font-mono font-bold text-gray-300 uppercase flex items-center gap-1">
                  <Eye size={10} />
                  <span>Реалтайм превью</span>
                </span>

                <div
                  className={`bg-white p-3 rounded-lg shadow-md border border-gray-150 flex flex-col items-center transition-all duration-300 w-full max-w-[220px] ${
                    photoCardSize === 'small' ? 'scale-90 opacity-90' : photoCardSize === 'huge' ? 'scale-110 shadow-lg' : ''
                  }`}
                  style={{ transform: `rotate(${-1.5}deg)` }}
                >
                  <div className="w-full aspect-[4/3] bg-neutral-100 overflow-hidden rounded relative border border-gray-200">
                    <img
                      src={uploadedSrc || `https://picsum.photos/seed/love-${Date.now()}/600/450`}
                      alt="Превью"
                      className="origin-center transition-transform duration-100"
                      style={{
                        transform: `scale(${photoScale}) rotate(${photoRotate}deg) translate(${photoShiftX}px, ${photoShiftY}px)`,
                        filter: photoFilter,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="mt-3.5 w-full text-center">
                    <span className="text-[9px] text-gray-300 font-mono block">📅 {newDate || 'ЧАС СЧАСТЬЯ'}</span>
                    {newTitle && (
                      <h4 className="font-semibold text-xs text-gray-800 tracking-tight block truncate mt-0.5">
                        {newTitle}
                      </h4>
                    )}
                    <p className="font-serif text-[10px] text-gray-550 italic px-1 truncate mt-0.5">
                      {newCaption || 'Здесь будет подпись...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Captions and submit fields */}
              <div className="lg:col-span-3 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Название момента:</label>
                    <input
                      type="text"
                      required
                      placeholder="Например: Сладкое свидание"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-pink-100 focus:outline-rose-300 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Когда это было?</label>
                    <input
                      type="text"
                      placeholder="Например: Август 2025"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-pink-100 focus:outline-rose-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Милая подпись на обороте:</label>
                    <textarea
                      required
                      placeholder="Напиши самое сокровенное..."
                      value={newCaption}
                      onChange={(e) => setNewCaption(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-pink-100 focus:outline-rose-300 text-xs resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-2 text-xs font-semibold text-gray-400 hover:text-gray-650 cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Добавить момент
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid containing customized polaroids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {photos.map((item) => {
          // Determine grid card sizing class
          const finalSizeStyle = item.cardSize === 'small'
            ? 'scale-95 text-xs p-3'
            : item.cardSize === 'huge'
            ? 'col-span-1 sm:col-span-2 scale-102 p-5 border-rose-100 bg-rose-50/10'
            : 'p-4';

          return (
            <motion.div
              key={item.id}
              layout
              whileHover={{ scale: 1.025, rotate: Math.random() > 0.5 ? 1.5 : -1.5 }}
              className={`bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col items-center text-center cursor-pointer group transition-all relative select-none ${finalSizeStyle}`}
              id={`polaroid-${item.id}`}
              onClick={() => setSelectedPhoto(item)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({
                  x: e.clientX,
                  y: e.clientY,
                  photoId: item.id
                });
              }}
            >
              {/* Очень заметная кнопочка-крестик для быстрого и простого удаления фотографии (теперь с милым подтверждением!) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoToDelete(item);
                }}
                className="absolute top-3 right-3 z-30 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white p-1.5 rounded-full shadow-md border border-white transition-all duration-200"
                title="Удалить воспоминание"
              >
                <X size={12} className="stroke-[3.5]" />
              </button>

              {/* Aspect picture frame with custom image offsets & edits */}
              <div className="w-full aspect-[4/3] bg-neutral-100 overflow-hidden rounded-xl relative border border-gray-150 shadow-inner">
                <img
                  src={item.src}
                  alt={item.alt}
                  style={{
                    transform: `scale(${item.scale || 1.05}) rotate(${item.rotate || 0}deg) translate(${item.shiftX || 0}px, ${item.shiftY || 0}px)`,
                    filter: item.filter || 'normal',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  className="transition-transform duration-500 group-hover:brightness-105"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-0 bg-rose-900/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <HeartHandshake className="text-white drop-shadow-md animate-bounce" size={item.cardSize === 'small' ? 24 : 36} />
                </div>
              </div>

              {/* Captions space */}
              <div className="mt-4 w-full flex-1 flex flex-col justify-between pb-2">
                <div>
                  <div className="inline-flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full mb-1.5">
                    <span className="text-[10px] text-rose-500 font-sans font-extrabold tracking-tight">
                      📅 {item.date}
                    </span>
                  </div>
                  {item.title && (
                    <h4 className="font-sans text-[13.5px] font-extrabold text-stone-900 tracking-tight leading-snug break-words px-2 mb-1.5">
                      {item.title}
                    </h4>
                  )}
                  <p className="font-sans text-xs text-stone-750 px-2.5 font-normal leading-relaxed break-words">
                    {item.caption}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox / Expanded modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-white p-6 rounded-3xl max-w-2xl w-full flex flex-col items-center relative shadow-2xl border border-pink-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Полноценный очень яркий и контрастный крестик закрытия модалки */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white p-2.5 rounded-full shadow-lg border-2 border-white transition-all duration-200 z-50 cursor-pointer"
                title="Закрыть"
              >
                <X size={18} className="stroke-[3.5]" />
              </button>

              <div className="w-full rounded-2xl overflow-hidden shadow-inner max-h-[55vh] flex items-center justify-center bg-zinc-50 border border-gray-150">
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.alt}
                  style={{
                    transform: `scale(${selectedPhoto.scale || 1}) rotate(${selectedPhoto.rotate || 0}deg) translate(${selectedPhoto.shiftX || 0}px, ${selectedPhoto.shiftY || 0}px)`,
                    filter: selectedPhoto.filter || 'normal',
                    width: '100%',
                    maxHeight: '55vh',
                    objectFit: 'contain'
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="mt-5 w-full text-center pb-2">
                <div className="inline-flex items-center gap-1 bg-rose-50 px-3 py-1 rounded-full mb-2.5">
                  <span className="text-xs text-rose-600 font-sans font-extrabold">
                    📅 {selectedPhoto.date}
                  </span>
                </div>
                {selectedPhoto.title && (
                  <h3 className="text-lg font-sans font-extrabold text-stone-900 tracking-tight mt-1 mb-2">
                    {selectedPhoto.title}
                  </h3>
                )}
                <p className="font-sans text-sm text-stone-700 font-normal leading-relaxed px-6">
                  {selectedPhoto.caption}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Context Menu on Right Click */}
      <AnimatePresence>
        {contextMenu && (
          <>
            {/* Invisible backdrop to dismiss with any regular action */}
            <div 
              className="fixed inset-0 z-40 cursor-default" 
              onClick={() => setContextMenu(null)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.12 }}
              style={{ top: contextMenu.y, left: contextMenu.x }}
              className="fixed z-50 bg-white/95 backdrop-blur border border-pink-100 rounded-2xl p-1.5 shadow-xl min-w-[190px] pointer-events-auto"
            >
              <button
                onClick={() => {
                  const targetPhoto = photos.find(p => p.id === contextMenu.photoId);
                  if (targetPhoto) {
                    setPhotoToDelete(targetPhoto);
                  }
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 size={14} className="stroke-[2.5]" />
                <span>Удалить этот момент</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sweet Reassurance & Tender Deletion Dialogue Modal */}
      <AnimatePresence>
        {photoToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setPhotoToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              className="bg-white p-6 rounded-3xl max-w-md w-full text-center relative shadow-2xl border border-pink-100 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 animate-pulse">
                <Heart size={28} className="fill-rose-300" />
              </div>
              
              <h3 className="text-base font-extrabold text-stone-900 tracking-tight">Сохранено в памяти сердца 💕</h3>
              
              <p className="text-xs sm:text-xs text-stone-600 leading-relaxed font-sans px-2 text-balance leading-relaxed">
                «Не переживай, даже если ты удаляешь эту карточку отсюда, наши воспоминания всё равно останутся навечно гореть тёплым огоньком у нас в памяти, где никто не сможет их стереть... 💕🔒»
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setPhotoToDelete(null)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Оставить в альбоме
                </button>
                <button
                  onClick={() => {
                    onDeletePhoto(photoToDelete.id);
                    setPhotoToDelete(null);
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-rose-450 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Всё равно стереть
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
