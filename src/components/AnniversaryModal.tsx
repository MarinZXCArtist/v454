import React, { useEffect } from 'react';
import { Heart, Sparkles, PartyPopper, Trophy, X, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface AnniversaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  yearsTogether: number;
  startDateStr: string;
}

export const AnniversaryModal: React.FC<AnniversaryModalProps> = ({
  isOpen,
  onClose,
  yearsTogether,
  startDateStr
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire festive fireworks confetti burst
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#f43f5e', '#ec4899', '#f59e0b', '#fb7185']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#f43f5e', '#ec4899', '#f59e0b', '#fb7185']
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          className="relative max-w-lg w-full bg-white rounded-3xl p-8 shadow-2xl border-2 border-rose-200 text-center overflow-hidden romantic-card-shadow"
        >
          {/* Decorative floating hearts background */}
          <div className="absolute top-2 left-4 text-rose-300 opacity-20 text-4xl select-none animate-bounce">
            ❤️
          </div>
          <div className="absolute bottom-4 right-4 text-pink-300 opacity-20 text-5xl select-none animate-pulse">
            💖
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Crown Emblem */}
          <div className="w-20 h-20 bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl shadow-rose-500/30 border-4 border-white animate-pulse">
            <PartyPopper className="w-10 h-10 text-white" />
          </div>

          <span className="inline-block px-4 py-1 bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs uppercase tracking-widest rounded-full mb-3">
            С ДНЁМ ГОДОВЩИНЫ! 🎉
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-handwriting text-slate-800 mb-3">
            Поздравляем с Годовщиной Любви! ❤️
          </h2>

          <div className="bg-rose-50/80 p-5 rounded-2xl border border-rose-200 my-4 text-left">
            <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed mb-3">
              Дорогие <span className="font-bold text-rose-600">Марин и Диана</span>! В этот особенный день ровно{' '}
              <span className="font-extrabold text-rose-600">{yearsTogether} года назад</span> ({startDateStr}) началась ваша невероятная сказочная история.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed italic font-script text-base">
              «Пусть каждый новый день приносит вам еще больше объятий, уюта, радостного смеха и бесконечной нежности. Вы — лучшая пара!»
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={onClose}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Спасибо, продолжить просмотр!</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
