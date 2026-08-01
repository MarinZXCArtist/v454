import React, { useState, useEffect } from 'react';
import { Gift, CheckCircle2, Sparkles, Heart, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface Coupon {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'c-1',
    title: 'Расслабляющий Массаж',
    description: '15 минут массажа спинки и плеч от Марина в любой момент дня',
    icon: '💆‍♀️'
  },
  {
    id: 'c-2',
    title: 'Романтический Ужин',
    description: 'Вкусный ужин или заказ твоей любимой еды без вопросов',
    icon: '🕯️'
  },
  {
    id: 'c-3',
    title: 'День Без Споров',
    description: 'Марин соглашается со всем, что ты скажешь весь день!',
    icon: '😇'
  },
  {
    id: 'c-4',
    title: 'Выбор Фильма на Вечер',
    description: 'Ты выбираешь любой фильм или сериал, а Марин готовит вкусняшки',
    icon: '🎬'
  },
  {
    id: 'c-5',
    title: 'Любой Сюрприз на Выбор',
    description: 'Купон на исполнение одного твоего нежного желания',
    icon: '🌟'
  }
];

export const LoveCoupons: React.FC = () => {
  const [redeemed, setRedeemed] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('love_redeemed_coupons');
    return saved ? JSON.parse(saved) : {};
  });

  const handleRedeem = (e: React.MouseEvent, couponId: string) => {
    e.stopPropagation();

    // Trigger confetti
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 35,
      spread: 70,
      origin: { x, y },
      colors: ['#f43f5e', '#ec4899', '#f59e0b']
    });

    const updated = { ...redeemed, [couponId]: true };
    setRedeemed(updated);
    localStorage.setItem('love_redeemed_coupons', JSON.stringify(updated));
  };

  return (
    <section className="w-full my-8 bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 romantic-card-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-rose-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-md">
              <Gift className="w-4 h-4" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 font-sans">
              Купоны Желаний для Дианы 🎁
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Нажми «Использовать», когда захочешь предъявить купон Марину!
          </p>
        </div>

        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 self-start sm:self-auto">
          Действительны всегда ❤️
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INITIAL_COUPONS.map((coupon) => {
          const isUsed = redeemed[coupon.id];

          return (
            <motion.div
              key={coupon.id}
              whileHover={{ y: -3 }}
              className={`relative p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isUsed
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : 'bg-gradient-to-br from-rose-50/70 to-pink-50/40 border-rose-200/90 hover:border-rose-300 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-3xl">{coupon.icon}</span>
                  {isUsed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Использован
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-white px-2 py-0.5 rounded-full border border-rose-200">
                      <Sparkles className="w-3 h-3" /> Купон
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-base text-slate-800 mb-1">
                  {coupon.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">
                  {coupon.description}
                </p>
              </div>

              {isUsed ? (
                <div className="text-xs font-bold text-emerald-700 bg-emerald-100/80 py-2 rounded-xl text-center border border-emerald-200">
                  Активировано с любовью! 💕
                </div>
              ) : (
                <button
                  onClick={(e) => handleRedeem(e, coupon.id)}
                  className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>Использовать Купон</span>
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
