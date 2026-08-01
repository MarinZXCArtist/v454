import React, { useState } from 'react';
import { X, ImagePlus, Sparkles, Upload, Check, Quote, Music, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { addPhotoToFirebase, addQuoteToFirebase } from '../lib/firebase';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'photo' | 'quote'>('photo');

  // Photo form states
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoDate, setPhotoDate] = useState('');
  const [photoCategory, setPhotoCategory] = useState<'Свидания' | 'Путешествия' | 'Милости'>('Свидания');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Quote form states
  const [quoteText, setQuoteText] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('Марин');

  if (!isOpen) return null;

  // Helper to handle local file upload & compression
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image using Canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to webp/jpeg data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setPhotoUrl(dataUrl);
        setIsUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) {
      alert('Пожалуйста, выберите изображение или укажите ссылку!');
      return;
    }
    if (!photoTitle.trim()) {
      alert('Пожалуйста, укажите название фотографии!');
      return;
    }

    setIsUploading(true);
    try {
      await addPhotoToFirebase({
        url: photoUrl,
        title: photoTitle.trim(),
        date: photoDate.trim() || new Date().toLocaleDateString('ru-RU'),
        category: photoCategory
      });

      setSuccessMessage('Фотография успешно добавлена на Firebase! 🎉');
      setPhotoTitle('');
      setPhotoDate('');
      setPhotoUrl('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert('Ошибка при сохранении фото!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteText.trim()) return;

    setIsUploading(true);
    try {
      await addQuoteToFirebase(quoteText.trim(), quoteAuthor.trim() || 'Марин');
      setSuccessMessage('Нежная мысль добавлена в копилку! 💖');
      setQuoteText('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert('Ошибка при добавлении мысли!');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative max-w-xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-100 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Админ Панель (Код 525252)</h3>
              <p className="text-xs text-amber-600 font-semibold">
                Управление фотогалереей и воспоминаниями Firebase
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-rose-50 p-1 rounded-2xl mb-6">
          <button
            onClick={() => setActiveTab('photo')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'photo' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImagePlus className="w-4 h-4" />
            <span>Добавить Фото</span>
          </button>

          <button
            onClick={() => setActiveTab('quote')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'quote' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Quote className="w-4 h-4" />
            <span>Добавить Мысль</span>
          </button>
        </div>

        {/* Feedback Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Photo Form */}
        {activeTab === 'photo' && (
          <form onSubmit={handleAddPhoto} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Загрузить снимок или ввести ссылку:
              </label>
              
              <div className="flex gap-2 mb-2">
                <label className="flex-1 border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/50 hover:bg-rose-50 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1">
                  <Upload className="w-6 h-6 text-rose-500" />
                  <span className="text-xs font-bold text-slate-700">Выбрать файл с устройства</span>
                  <span className="text-[10px] text-slate-400">Авто-сжатие для Firebase</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Или вставьте URL картинки..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-rose-400"
              />

              {photoUrl && (
                <div className="mt-2 relative w-full h-32 bg-slate-100 rounded-2xl overflow-hidden border border-rose-200">
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Превью готово
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Название момента:</label>
                <input
                  type="text"
                  required
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  placeholder="Например: Прогулка в парке"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Дата (необязательно):</label>
                <input
                  type="text"
                  value={photoDate}
                  onChange={(e) => setPhotoDate(e.target.value)}
                  placeholder="14.07.2024"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Категория:</label>
              <select
                value={photoCategory}
                onChange={(e) => setPhotoCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-400 cursor-pointer"
              >
                <option value="Свидания">Свидания</option>
                <option value="Путешествия">Путешествия</option>
                <option value="Милости">Милости</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {isUploading ? 'Сохранение...' : 'Сохранить на Firebase 🚀'}
            </button>
          </form>
        )}

        {/* Quote Form */}
        {activeTab === 'quote' && (
          <form onSubmit={handleAddQuote} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Нежное послание / воспоминание:
              </label>
              <textarea
                required
                rows={4}
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="Напиши здесь самые теплые слова для Дианы..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-rose-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Подпись (Автор):</label>
              <input
                type="text"
                value={quoteAuthor}
                onChange={(e) => setQuoteAuthor(e.target.value)}
                placeholder="Марин"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-rose-400"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {isUploading ? 'Добавление...' : 'Добавить в Копилку ✨'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
