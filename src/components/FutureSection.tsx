import React, { useState } from 'react';
import { DreamItem } from '../types';
import { Compass, Home, Sparkles, Smile, Plus, Trash2, Heart, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FutureSectionProps {
  dreams: DreamItem[];
  onToggleDream: (id: string) => void;
  onAddDream: (title: string, category: 'travel' | 'home' | 'activity' | 'general', notes?: string) => void;
  onDeleteDream: (id: string) => void;
}

export default function FutureSection({ dreams, onToggleDream, onAddDream, onDeleteDream }: FutureSectionProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'travel' | 'home' | 'activity' | 'general'>('general');
  const [newNotes, setNewNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddDream(newTitle, newCategory, newNotes ? newNotes : undefined);
    setNewTitle('');
    setNewNotes('');
    setIsAdding(false);
  };

  const getCategoryIcon = (category: 'travel' | 'home' | 'activity' | 'general') => {
    switch (category) {
      case 'travel':
        return <Compass className="text-sky-400" size={18} />;
      case 'home':
        return <Home className="text-amber-400" size={18} />;
      case 'activity':
        return <Sparkles className="text-rose-400" size={18} />;
      default:
        return <Smile className="text-emerald-400" size={18} />;
    }
  };

  const getCategoryLabel = (category: 'travel' | 'home' | 'activity' | 'general') => {
    switch (category) {
      case 'travel':
        return 'Путешествия';
      case 'home':
        return 'Наш очаг';
      case 'activity':
        return 'Совместный движ';
      default:
        return 'Разное';
    }
  };

  return (
    <div id="future-dreams-section" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Compass className="text-rose-500 animate-spin-slow" size={24} />
            <span>Наш Любовный Bucket List</span>
          </h2>
          <p className="text-gray-500 text-xs">Наши общие идеи, сумасшедшие мечты и планы на будущие годы...</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-pink-100 hover:bg-pink-100 text-rose-600 font-semibold rounded-2xl flex items-center gap-2 text-sm transition-all shadow-sm cursor-pointer self-start"
          id="add-dream-toggle"
        >
          <Plus size={16} />
          <span>Мечтать дальше</span>
        </button>
      </div>

      {/* Add Dream Form */}
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
              className="p-5 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-4"
              id="dream-add-form"
            >
              <h3 className="font-bold text-rose-600 text-sm flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>Записать новую общую мечту</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Что мы сделаем вместе?</label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Посмотреть на китов в океане..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-pink-100 focus:outline-rose-300 text-sm"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Категория</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-pink-100 focus:outline-rose-300 text-sm"
                  >
                    <option value="travel">Путешествие ✈️</option>
                    <option value="home">Дом и Уют 🏠</option>
                    <option value="activity">Активность 🎡</option>
                    <option value="general">Разное 🧸</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Маленькая заметка/подпись (необязательно)</label>
                <input
                  type="text"
                  placeholder="Зачем или когда мы это сделаем?"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-pink-100 focus:outline-rose-300 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-gray-600"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-400 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Внести в планы
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dreams.map((item) => (
          <motion.div
            key={item.id}
            layout
            className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 relative group ${
              item.completed
                ? 'bg-rose-100/30 border-rose-200'
                : 'bg-white hover:bg-neutral-50/50 border-gray-100 shadow-sm'
            }`}
          >
            {/* Custom Checkbox Action Component */}
            <button
              onClick={() => onToggleDream(item.id)}
              className="mt-0.5 p-1 rounded-full cursor-pointer focus:outline-none transition-transform active:scale-125 text-rose-400"
              title={item.completed ? 'Отметить как невыполненное' : 'Отметить как выполненное!'}
            >
              {item.completed ? (
                <Heart className="fill-rose-400 text-rose-500" size={22} />
              ) : (
                <Heart className="text-gray-300 hover:text-rose-300" size={22} />
              )}
            </button>

            {/* List Item textual info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {getCategoryIcon(item.category)}
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  {getCategoryLabel(item.category)}
                </span>
              </div>

              <h4
                className={`text-sm font-semibold text-gray-800 pr-5 truncate mt-1 ${
                  item.completed ? 'line-through text-gray-400' : ''
                }`}
              >
                {item.title}
              </h4>

              {item.notes && (
                <p className="text-xs text-gray-400 font-serif italic mt-1 leading-snug">
                  📌 {item.notes}
                </p>
              )}
            </div>

            {/* Trash option */}
            <button
              onClick={() => onDeleteDream(item.id)}
              className="absolute top-4 right-4 p-1 text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity rounded"
              title="Удалить из списка"
            >
              <Trash2 size={14} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
