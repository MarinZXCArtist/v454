import React, { useState } from 'react';
import { Milestone } from '../types';
import { Calendar, Plus, Heart, Trash2, Edit2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TimelineSectionProps {
  milestones: Milestone[];
  onAddMilestone: (m: Milestone) => void;
  onDeleteMilestone: (id: string) => void;
}

export default function TimelineSection({ milestones, onAddMilestone, onDeleteMilestone }: TimelineSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEmoji, setNewEmoji] = useState('💕');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate || !newDesc) return;

    onAddMilestone({
      id: Date.now().toString(),
      title: newTitle,
      date: newDate,
      description: newDesc,
      emoji: newEmoji,
    });

    setNewTitle('');
    setNewDate('');
    setNewDesc('');
    setIsAdding(false);
  };

  return (
    <div id="timeline-section" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Heart className="text-rose-500 fill-rose-500" size={24} />
            <span>Наша Хронология Любви</span>
          </h2>
          <p className="text-gray-500 text-xs">Наши главные вехи и самые теплые общие даты за эти 2 года</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-600 font-semibold rounded-2xl flex items-center gap-2 text-sm transition-all shadow-sm cursor-pointer self-start"
          id="add-milestone-toggle"
        >
          <Plus size={16} />
          <span>Добавить момент</span>
        </button>
      </div>

      {/* Add Milestone Form */}
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
              id="timeline-add-form"
            >
              <h3 className="font-bold text-rose-600 text-sm flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>Запечатлеть новое воспоминание</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Дата</label>
                  <input
                    type="text"
                    required
                    placeholder="Например: 14.07.2024"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-pink-100 focus:outline-rose-300 text-sm"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Название момента</label>
                  <input
                    type="text"
                    required
                    placeholder="Как назовем деталь?"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-pink-100 focus:outline-rose-300 text-sm"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Эмодзи</label>
                  <select
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-pink-100 focus:outline-rose-300 text-sm"
                  >
                    <option value="💖">💖 Любовь</option>
                    <option value="✨">✨ Волшебство</option>
                    <option value="🥰">🥰 Нежность</option>
                    <option value="🍁">🍁 Осень</option>
                    <option value="❄️">❄️ Зима</option>
                    <option value="🌸">🌸 Весна</option>
                    <option value="☀️">☀️ Лето</option>
                    <option value="🚗">🚗 Поездка</option>
                    <option value="🍿">🍿 Кино</option>
                    <option value="🍕">🍕 Пицца</option>
                    <option value="🎁">🎁 Сюрприз</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Описание воспоминания</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Опиши этот момент своими словами. Почему он такой ценный для тебя?"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-pink-100 focus:outline-rose-300 text-sm resize-none"
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
                  Сохранить веху
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestones Flow */}
      <div className="relative border-l-2 border-rose-200 pl-6 ml-3 space-y-8 py-2">
        {milestones.length === 0 ? (
          <p className="text-gray-400 text-sm italic">Вы можете добавить первую веху в вашу историю с помощью кнопки вверху!</p>
        ) : (
          milestones.map((milestone, idx) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4 }}
              className="relative group"
            >
              {/* Connector Heart dot */}
              <div className="absolute -left-[35px] top-1.5 bg-white p-1 rounded-full border-2 border-rose-300 z-10 text-rose-500 select-none group-hover:scale-125 transition-transform">
                <span className="text-sm block leading-none">{milestone.emoji}</span>
              </div>

              {/* Main milestone line block */}
              <div className="p-5 bg-white rounded-2xl border border-pink-50 shadow-sm group-hover:shadow-md transition-shadow relative">
                {/* Delete button (only if added by user or customized) */}
                <button
                  onClick={() => onDeleteMilestone(milestone.id)}
                  className="absolute top-4 right-4 p-1 text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                  title="Удалить веху"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex items-center gap-1 text-xs text-rose-500 font-bold mb-1">
                  <Calendar size={12} />
                  <span>{milestone.date}</span>
                </div>

                <h3 className="font-bold text-gray-800 pr-6 text-base group-hover:text-rose-600 transition-colors">
                  {milestone.title}
                </h3>

                <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                  {milestone.description}
                </p>

                {milestone.image && (
                  <div className="mt-4 rounded-xl overflow-hidden max-h-48 border border-pink-100 shadow-inner">
                    <img
                      src={milestone.image}
                      alt={milestone.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
