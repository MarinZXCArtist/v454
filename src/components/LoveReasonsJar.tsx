import React, { useState } from 'react';
import { Heart, Sparkles, RefreshCw, MessageCircleHeart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

const REASONS = [
  'За твою самую искреннюю и теплую улыбку, которая освещает весь день',
  'За то, как ты мило смеешься над моими шутками',
  'За твои нежные и самые уютные обнимашки в мире',
  'За твои прекрасные глаза, в которых можно утонуть',
  'За то, как ты заботишься обо мне каждый день',
  'За то, что рядом с тобой я чувствую себя самым счастливым',
  'За твой отличный вкус и чувство юмора',
  'За то, что ты умеешь поддерживать в любой момент',
  'За то, что ты сделала мою жизнь бесконечно ярче и слаще',
  'За то, что ты — моя самая лучшая подруга и любимая девчонка',
  'За то, что ты — это просто ты, единственная и неповторимая!',
  'За то, как ты смотришь на меня',
  'За то, что ты всегда остаешься собой',
  'За то, что ты умеешь радоваться мелочам',
  'За то, что ты веришь в меня даже тогда, когда я сомневаюсь в себе',
  'За твое терпение',
  'За то, как мило ты спишь',
  'За твой голос, который хочется слушать бесконечно',
  'За твой запах, который сразу успокаивает',
  'За то, что с тобой можно быть настоящим',
  'За то, что ты вдохновляешь меня становиться лучше',
  'За то, что рядом с тобой я забываю обо всех проблемах',
  'За то, как ты радуешься моим успехам',
  'За твою естественную красоту',
  'За твою нежность',
  'За твою ласку',
  'За твою верность',
  'За то, что ты делаешь меня лучше',
  'За наши объятия после долгой разлуки',
  'За то, что с тобой хочется строить будущее',
  'За то, что ты всегда находишь место для меня в своей жизни',
  'За то, что ты стала моей привычкой, без которой я уже не представляю свою жизнь',
  'За то, что я скучаю по тебе, даже когда мы расстаемся всего на несколько часов',
  'За то, что каждый новый день с тобой хочется прожить еще лучше предыдущего',
  'За то, что с тобой любое «навсегда» кажется слишком коротким',
  'За то, что благодаря тебе я понял, что такое настоящее счастье',
  'За то, что ты — мой любимый человек во всем мире ❤️'
];

export const LoveReasonsJar: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 20,
      spread: 50,
      origin: { x, y },
      colors: ['#f43f5e', '#ec4899', '#fda4af']
    });

    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * REASONS.length);
    } while (nextIdx === currentIndex && REASONS.length > 1);

    setCurrentIndex(nextIdx);
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 border border-rose-100 romantic-card-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-md">
            <MessageCircleHeart className="w-4 h-4" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 font-sans">
            Почему я люблю тебя 💌
          </h3>
        </div>

        <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200/80 my-3 min-h-[90px] flex items-center justify-center text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="text-base sm:text-lg font-script font-bold text-rose-700 leading-relaxed"
            >
              «{REASONS[currentIndex]}»
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <button
        onClick={handleNext}
        className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
      >
        <Sparkles className="w-4 h-4" />
        <span>Достать еще одну причину ✨</span>
      </button>
    </div>
  );
};
