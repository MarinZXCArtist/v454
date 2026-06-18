import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Lock, KeyRound, Sparkles } from 'lucide-react';

interface PasswordScreenProps {
  onUnlock: (isAdmin: boolean) => void;
}

export default function PasswordScreen({ onUnlock }: PasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; left: number; delay: number; scale: number }[]>([]);

  useEffect(() => {
    const newHearts = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      scale: 0.5 + Math.random() * 1.2,
    }));
    setHearts(newHearts);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '525252') {
      setIsSuccess(true);
      setError('');
      setTimeout(() => onUnlock(true), 1200);
    } else if (password === '202917') {
      setIsSuccess(true);
      setError('');
      setTimeout(() => onUnlock(false), 1200);
    } else {
      setError('Пароль не подошёл, но поцелуй от меня гарантирован в любом случае 🖤');
      setPassword('');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-tr from-rose-50 via-pink-100 to-rose-100">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute bottom-[-10%] text-rose-300 opacity-60 animate-floating"
            style={{ left: `${heart.left}%`, animationDelay: `${heart.delay}s`, transform: `scale(${heart.scale})` }}
          >
            <Heart className="fill-rose-300" size={24} />
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="lock-card"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="relative z-10 w-full max-w-md p-8 m-4 bg-white/70 backdrop-blur-md rounded-3xl border border-pink-100 shadow-2xl text-center"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-rose-400 text-white p-4 rounded-full shadow-lg">
              <Heart className="fill-white animate-pulse" size={32} />
            </div>
            <div className="mt-6 mb-8">
              <h1 className="text-3xl font-bold font-serif text-rose-500 mb-2 mt-2">Наш уютный уголок 🤍</h1>
              <p className="text-gray-600 text-sm px-4">Привет, моя любимая девочка! Я создал этот особенный сюрприз для нас. Чтобы войти, введи нужный код</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-rose-400">
                  <KeyRound size={20} />
                </div>
                <input
                  type="password"
                  placeholder="Введите пароль (******)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-rose-50/50 hover:bg-rose-50 focus:bg-white rounded-2xl border-2 border-rose-200 focus:border-rose-400 outline-none transition-all duration-300 placeholder-rose-300 text-center font-mono tracking-widest text-lg text-rose-700"
                  maxLength={10}
                  autoFocus
                />
              </div>
              <AnimatePresence mode="popLayout">
                {error && (
                  <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="text-xs text-rose-500 font-medium">
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
              <button type="submit" className="w-full py-4 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-medium rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group">
                <span>Войти в наш мир</span>
                <Sparkles size={18} className="group-hover:translate-x-1 group-hover:rotate-12 transition-transform" />
              </button>
            </form>
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-rose-400 font-mono">
              <Lock size={12} />
              <span>Защищено теплотой и обнимашками</span>
            </div>
          </motion.div>
        ) : (
          <motion.div key="success-card" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 text-center text-rose-600 space-y-4">
            <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="inline-block bg-white text-rose-500 p-6 rounded-full shadow-2xl border-4 border-rose-400">
              <Heart className="fill-rose-500" size={64} />
            </motion.div>
            <motion.h2 initial={{ y: 20 }} animate={{ y: 0 }} className="text-4xl font-bold font-serif text-rose-600">Пароль верный! 🎉</motion.h2>
            <p className="text-rose-500/80 font-serif text-lg tracking-wide">Добро пожаловать в нашу историю любви... Открываю занавес!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
