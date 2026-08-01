import React, { useState } from 'react';
import { Key, Sparkles, Lock, Heart, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PasswordMode } from '../types';

interface PasswordModalProps {
  isOpen: boolean;
  onSuccess: (mode: PasswordMode) => void;
  onClose?: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onSuccess, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = password.trim();

    if (trimmed === '202917') {
      setError('');
      onSuccess('202917');
    } else if (trimmed === '2029') {
      setError('');
      onSuccess('2029');
    } else if (trimmed === '525252') {
      setError('');
      onSuccess('525252');
    } else {
      setError('Неверный код доступа. Попробуй ещё раз! 💕');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/30 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`relative w-full max-w-md bg-white rounded-3xl p-8 pt-12 shadow-2xl border border-pink-100 romantic-card-shadow text-center ${
            isShaking ? 'animate-bounce' : ''
          }`}
        >
          {/* Top Heart Badge */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/40 border-4 border-white">
            <Heart className="w-7 h-7 text-white fill-white animate-pulse" />
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold font-handwriting text-rose-600 mb-3 flex items-center justify-center gap-2">
            Наш уютный уголок
            <Heart className="w-6 h-6 text-slate-800 stroke-[2] inline-block" />
          </h2>

          {/* Subtitle */}
          <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6 font-medium px-2">
            Привет, моя любимая девочка! Я создал этот особенный сюрприз для нас. Чтобы войти, введи нужный код
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-rose-400">
                <Key className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Введите пароль (******)"
                autoFocus
                className="w-full pl-12 pr-4 py-3.5 bg-rose-50/50 border-2 border-rose-200 rounded-2xl text-slate-800 placeholder-rose-300 font-semibold focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-100 transition-all text-center tracking-wider text-lg"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-semibold text-rose-500 bg-rose-50 py-1.5 px-3 rounded-lg border border-rose-200"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full py-4 px-6 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
            >
              Войти в наш мир
              <Sparkles className="w-5 h-5 animate-pulse" />
            </button>
          </form>

          {/* Footer Security Badge */}
          <div className="mt-6 pt-4 border-t border-pink-100 flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>Защищено теплотой и обнимашками</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
