import React, { useState } from 'react';
import { LoveLetter } from '../types';
import { Mail, MailOpen, Plus, Trash2, Heart, Send, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LetterSectionProps {
  letters: LoveLetter[];
  onAddLetter: (letter: LoveLetter) => void;
  onDeleteLetter: (id: string) => void;
}

export default function LetterSection({ letters, onAddLetter, onDeleteLetter }: LetterSectionProps) {
  const [openedLetterId, setOpenedLetterId] = useState<string | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [paperType, setPaperType] = useState<'classic' | 'vintage' | 'heart' | 'stars'>('classic');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender.trim() || !recipient.trim() || !message.trim()) return;

    onAddLetter({
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('ru-RU'),
      sender,
      recipient,
      message,
      paperType,
    });

    setSender('');
    setRecipient('');
    setMessage('');
    setIsWriting(false);
  };

  const getPaperStyles = (type: 'classic' | 'vintage' | 'heart' | 'stars') => {
    switch (type) {
      case 'vintage':
        return 'bg-[#fbf4e6] border-[#e4cc95] text-[#5c3e1e]';
      case 'heart':
        return 'bg-rose-50 border-rose-200 text-rose-800';
      case 'stars':
        return 'bg-purple-50/70 border-purple-200 text-purple-900';
      default:
        return 'bg-white border-pink-100 text-gray-800';
    }
  };

  return (
    <div id="love-letters-section" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Mail className="text-rose-500" size={24} />
            <span>Шкатулка Любовных Писем</span>
          </h2>
          <p className="text-gray-500 text-xs">Наши личные весточки, признания и поцелуи в конвертах 💌</p>
        </div>

        <button
          onClick={() => setIsWriting(!isWriting)}
          className="px-4 py-2 bg-pink-100 hover:bg-pink-100 text-rose-600 font-semibold rounded-2xl flex items-center gap-2 text-sm transition-all shadow-sm cursor-pointer self-start"
          id="add-letter-toggle"
        >
          <Plus size={16} />
          <span>Написать письмо</span>
        </button>
      </div>

      {/* Writing love letter form */}
      <AnimatePresence>
        {isWriting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleSubmit}
              className="p-5 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-4"
              id="letter-add-form"
            >
              <h3 className="font-bold text-rose-600 text-sm flex items-center gap-1.5">
                <Heart className="fill-rose-300 text-rose-400" size={14} />
                <span>Запечатать новые строки любви</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">От кого</label>
                  <input
                    type="text"
                    required
                    placeholder="Твой любимый / Диана"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-pink-100 focus:outline-rose-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Кому</label>
                  <input
                    type="text"
                    required
                    placeholder="Моя Вселенная / Марин"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-pink-100 focus:outline-rose-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Оформление бумаги</label>
                  <select
                    value={paperType}
                    onChange={(e) => setPaperType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-pink-100 focus:outline-rose-300 text-sm"
                  >
                    <option value="classic">Классическое белое ✉️</option>
                    <option value="vintage">Винтажный пергамент 📜</option>
                    <option value="heart">Нежно-розовые сердечки 🌸</option>
                    <option value="stars">Звездное фиолетовое ✨</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Твое искреннее послание</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Напиши все те теплые слова, которые переполняют твое сердце..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-pink-100 focus:outline-rose-300 text-sm resize-none font-serif text-lg leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWriting(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-gray-600"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white text-xs font-bold rounded-xl transition-all shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={12} />
                  <span>Положить в шкатулку</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enveloper lists wrapper */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {letters.map((letter) => {
          const isOpened = openedLetterId === letter.id;

          return (
            <div
              key={letter.id}
              className="flex flex-col items-center"
              id={`envelope-wrapper-${letter.id}`}
            >
              {/* Sealed Envelope Graphic representation */}
              <motion.div
                whileHover={{ y: -4 }}
                onClick={() => setOpenedLetterId(isOpened ? null : letter.id)}
                className={`w-full max-w-xs p-6 rounded-2xl border-2 shadow-sm hover:shadow-md cursor-pointer text-center relative overflow-hidden transition-all duration-300 ${
                  isOpened
                    ? 'bg-rose-100/50 border-rose-300 scale-[0.98]'
                    : 'bg-white border-pink-100'
                }`}
              >
                {/* Visual envelope flap styling */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-rose-300"></div>

                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className={`p-4 rounded-full transition-transform duration-300 ${isOpened ? 'bg-rose-200 text-rose-700 rotate-12' : 'bg-rose-50 text-rose-400'}`}>
                    {isOpened ? <MailOpen size={32} /> : <Mail size={32} />}
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">
                      Письмо для: <span className="text-rose-500 font-serif font-semibold text-lg">{letter.recipient}</span>
                    </h4>
                    <span className="text-[10px] text-gray-400 font-mono block mt-1">От: {letter.sender}</span>
                  </div>

                  <span className="text-xs text-rose-400 font-bold border border-rose-100 rounded-full px-3 py-1 bg-rose-50/20 font-mono">
                    {letter.date}
                  </span>
                </div>

                {/* Trash option */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLetter(letter.id);
                  }}
                  className="absolute top-4 right-4 p-1 text-gray-300 hover:text-rose-500 opacity-60 hover:opacity-100 transition-opacity"
                  title="Удалить это письмо"
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>

              {/* Opened physical flat letter paper sliding visualizer */}
              <AnimatePresence>
                {isOpened && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                    className="w-full max-w-xs overflow-hidden mt-3 z-10"
                  >
                    <div className={`p-5 rounded-2xl border-2 shadow-inner ${getPaperStyles(letter.paperType)}`}>
                      <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider mb-3 pb-2 border-b border-black/5">
                        <span className="flex items-center gap-1 font-mono"><User size={10} /> {letter.sender}</span>
                        <span className="flex items-center gap-1 font-mono"><Calendar size={10} /> {letter.date}</span>
                      </div>

                      {/* Handwritten typography display */}
                      <p className="font-serif text-xl leading-relaxed text-justify italic whitespace-pre-wrap">
                        {letter.message}
                      </p>

                      <div className="mt-4 pt-2 border-t border-black/5 text-center text-rose-500 font-serif font-bold text-base flex items-center justify-center gap-1">
                        <Heart className="fill-rose-400 text-rose-500" size={14} />
                        <span>Бесконечно люблю тебя</span>
                        <Heart className="fill-rose-400 text-rose-500" size={14} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
