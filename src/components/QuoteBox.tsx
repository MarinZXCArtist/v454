import React, { useState } from 'react';
import { Sparkles, HeartHandshake, RefreshCw, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QuoteItem } from '../types';

interface QuoteBoxProps {
  quotes: QuoteItem[];
}

export const QuoteBox: React.FC<QuoteBoxProps> = ({ quotes }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!quotes || quotes.length === 0) return null;

  const currentQuote = quotes[currentIndex % quotes.length];

  const nextQuote = () => {
    setCurrentIndex((prev) => (prev + 1) % quotes.length);
  };

  return (
    <div className="w-full bg-rose-50/70 border border-rose-200/90 rounded-3xl p-6 sm:p-8 romantic-card-shadow relative">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center text-white text-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-rose-600 font-sans">
            КОПИЛКА НЕЖНЫХ МЫСЛЕЙ
          </span>
        </div>

        {quotes.length > 1 && (
          <button
            onClick={nextQuote}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 bg-white px-3 py-1.5 rounded-full border border-rose-200 hover:shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Другая мысль</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuote.id || currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex items-start gap-4"
        >
          <Quote className="w-8 h-8 text-rose-300 shrink-0 rotate-180 hidden sm:block" />
          <div>
            <p className="text-lg sm:text-xl font-script text-slate-800 leading-relaxed italic mb-2">
              «{currentQuote.text}»
            </p>
            {currentQuote.author && (
              <p className="text-xs font-bold text-rose-500 font-sans text-right">
                — {currentQuote.author}
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
