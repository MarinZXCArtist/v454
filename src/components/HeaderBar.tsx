import React from 'react';
import { Heart, Lock, Key, Sparkles, Shield, ImagePlus } from 'lucide-react';
import { PasswordMode } from '../types';

interface HeaderBarProps {
  mode: PasswordMode;
  startDate: string;
  yearsTogetherText: string;
  onOpenLock: () => void;
  onOpenAdminModal?: () => void;
  onOpenAnniversaryModal?: () => void;
  showAnniversaryBtn?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  mode,
  startDate,
  yearsTogetherText,
  onOpenLock,
  onOpenAdminModal,
  onOpenAnniversaryModal,
  showAnniversaryBtn
}) => {
  const isAdmin = mode === '525252';

  return (
    <header className="sticky top-0 z-40 w-full py-4 px-4 sm:px-8 bg-white/80 backdrop-blur-md border-b border-rose-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Badge: Name & Duration */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-full border border-rose-200/80 shadow-xs">
            <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-white text-xs">
              <Heart className="w-3.5 h-3.5 fill-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm sm:text-base font-sans">
              Марин + Диана
            </span>

            <span className="bg-rose-100 text-rose-600 font-bold text-xs uppercase px-2.5 py-1 rounded-full tracking-wider border border-rose-200">
              {yearsTogetherText}
            </span>
          </div>

          {showAnniversaryBtn && (
            <button
              onClick={onOpenAnniversaryModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs rounded-full shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Поздравление 🎉</span>
            </button>
          )}
        </div>

        {/* Right Controls: Love Badge + Password Lock / Admin Toggle */}
        <div className="flex items-center gap-2">
          {/* Admin Mode Badge if Active */}
          {isAdmin && (
            <button
              onClick={onOpenAdminModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <ImagePlus className="w-4 h-4" />
              <span>Добавить Фото / Настройки</span>
            </button>
          )}

          {/* Romantic Badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-rose-50 text-rose-600 font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-full border border-rose-200 shadow-xs">
            <span>Люблю тебя сильно!</span>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
          </div>

          {/* Key / Lock Code Switcher */}
          <button
            onClick={onOpenLock}
            title="Сменить код / Заблокировать"
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-full border border-rose-200 shadow-xs transition-all cursor-pointer"
          >
            {isAdmin ? <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" /> : <Lock className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
