import React from 'react';
import { Heart, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FooterSectionProps {
  yearsText: string;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ yearsText }) => {
  const triggerLoveConfetti = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 50,
      spread: 80,
      origin: { x, y },
      colors: ['#f43f5e', '#ec4899', '#fb7185', '#fda4af']
    });
  };

  return (
    <footer className="w-full py-12 px-4 text-center relative overflow-hidden border-t border-rose-100/60 bg-gradient-to-b from-transparent to-rose-100/40">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        {/* Quote Symbol Emblem */}
        <div
          onClick={triggerLoveConfetti}
          title="Нажми для сюрприза! 💕"
          className="w-12 h-12 rounded-2xl bg-white border border-rose-200 text-rose-500 font-serif text-3xl font-extrabold flex items-center justify-center shadow-md mb-4 hover:scale-110 transition-transform cursor-pointer"
        >
          ❞
        </div>

        {/* Cursive Quote */}
        <p className="text-xl sm:text-2xl font-script text-slate-700 leading-relaxed italic mb-4 px-4">
          «Любить кого-то — значит видеть чудо, невидимое для других...<br className="hidden sm:inline" />
          И наши совместные моменты — тому доказательство!»
        </p>

        {/* Final Sign-off */}
        <div
          onClick={triggerLoveConfetti}
          className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-xs px-5 py-2 rounded-full border border-rose-200 text-xs sm:text-sm font-bold text-rose-600 shadow-2xs hover:shadow-md transition-all cursor-pointer"
        >
          <span>Марин</span>
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
          <span>Диана</span>
          <span className="text-slate-300">•</span>
          <span>{yearsText} в любви</span>
        </div>
      </div>
    </footer>
  );
};
