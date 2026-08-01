import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Heart, Sparkles } from 'lucide-react';
import { PasswordMode } from '../types';

interface TimeCounterCardProps {
  mode: PasswordMode;
  startDateStr: string; // "14.07.2024" or "01.09.2024"
  onOpenAnniversaryModal?: () => void;
  showAnniversaryBtn?: boolean;
}

export const TimeCounterCard: React.FC<TimeCounterCardProps> = ({ mode, startDateStr, onOpenAnniversaryModal, showAnniversaryBtn }) => {
  const [elapsed, setElapsed] = useState({
    totalDays: 0,
    hours: '00',
    minutes: '00',
    seconds: '00',
    totalHours: 0,
    totalMinutes: 0
  });

  const [nextAnniversary, setNextAnniversary] = useState({
    title: '',
    targetDateStr: '',
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [milestones, setMilestones] = useState<Array<{
    title: string;
    dateStr: string;
    daysLeft: number;
  }>>([]);

  // Parse "DD.MM.YYYY" into Date
  const parseRuDate = (str: string): Date => {
    const parts = str.split('.');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day, 0, 0, 0);
    }
    return new Date(2024, 6, 14, 0, 0, 0);
  };

  useEffect(() => {
    const startObj = parseRuDate(startDateStr);

    const updateTimer = () => {
      const now = new Date();
      const diffMs = Math.max(0, now.getTime() - startObj.getTime());

      // Elapsed time calculations
      const totalSeconds = Math.floor(diffMs / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = Math.floor(totalMinutes / 60);
      const totalDays = Math.floor(totalHours / 24);

      const hours = String(totalHours % 24).padStart(2, '0');
      const minutes = String(totalMinutes % 60).padStart(2, '0');
      const seconds = String(totalSeconds % 60).padStart(2, '0');

      setElapsed({
        totalDays,
        hours,
        minutes,
        seconds,
        totalHours,
        totalMinutes
      });

      // Calculate Next Anniversary
      const currentYear = now.getFullYear();
      let nextAnnivDate = new Date(currentYear, startObj.getMonth(), startObj.getDate(), 0, 0, 0);
      if (now.getTime() > nextAnnivDate.getTime()) {
        nextAnnivDate = new Date(currentYear + 1, startObj.getMonth(), startObj.getDate(), 0, 0, 0);
      }

      const yearsCount = nextAnnivDate.getFullYear() - startObj.getFullYear();
      const annivFormatted = `${String(nextAnnivDate.getDate()).padStart(2, '0')}.${String(nextAnnivDate.getMonth() + 1).padStart(2, '0')}.${nextAnnivDate.getFullYear()}`;

      const annivDiffMs = Math.max(0, nextAnnivDate.getTime() - now.getTime());
      const annivSecs = Math.floor(annivDiffMs / 1000);
      const annivMins = Math.floor(annivSecs / 60);
      const annivHours = Math.floor(annivMins / 60);
      const annivDays = Math.floor(annivHours / 24);

      setNextAnniversary({
        title: `до нашей ${yearsCount}-й годовщины отношений (${annivFormatted}):`,
        targetDateStr: annivFormatted,
        days: annivDays,
        hours: annivHours % 24,
        minutes: annivMins % 60,
        seconds: annivSecs % 60
      });

      // Calculate 4 Milestones
      // 1) 1000 Days
      const date1000 = new Date(startObj.getTime() + 1000 * 24 * 60 * 60 * 1000);
      const date1000Str = `${String(date1000.getDate()).padStart(2, '0')}.${String(date1000.getMonth() + 1).padStart(2, '0')}.${date1000.getFullYear()}`;
      const daysLeft1000 = Math.max(0, Math.ceil((date1000.getTime() - now.getTime()) / (1000 * 3600 * 24)));

      // 2) 3 Years
      const date3y = new Date(startObj.getFullYear() + 3, startObj.getMonth(), startObj.getDate());
      const date3yStr = `${String(date3y.getDate()).padStart(2, '0')}.${String(date3y.getMonth() + 1).padStart(2, '0')}.${date3y.getFullYear()}`;
      const daysLeft3y = Math.max(0, Math.ceil((date3y.getTime() - now.getTime()) / (1000 * 3600 * 24)));

      // 3) 5 Years
      const date5y = new Date(startObj.getFullYear() + 5, startObj.getMonth(), startObj.getDate());
      const date5yStr = `${String(date5y.getDate()).padStart(2, '0')}.${String(date5y.getMonth() + 1).padStart(2, '0')}.${date5y.getFullYear()}`;
      const daysLeft5y = Math.max(0, Math.ceil((date5y.getTime() - now.getTime()) / (1000 * 3600 * 24)));

      // 4) 10 Years
      const date10y = new Date(startObj.getFullYear() + 10, startObj.getMonth(), startObj.getDate());
      const date10yStr = `${String(date10y.getDate()).padStart(2, '0')}.${String(date10y.getMonth() + 1).padStart(2, '0')}.${date10y.getFullYear()}`;
      const daysLeft10y = Math.max(0, Math.ceil((date10y.getTime() - now.getTime()) / (1000 * 3600 * 24)));

      setMilestones([
        { title: '1000 Дней Вместе', dateStr: date1000Str, daysLeft: daysLeft1000 },
        { title: '3 Года в любви', dateStr: date3yStr, daysLeft: daysLeft3y },
        { title: '5 Лет Вместе', dateStr: date5yStr, daysLeft: daysLeft5y },
        { title: '10 Лет Счастья', dateStr: date10yStr, daysLeft: daysLeft10y }
      ]);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startDateStr]);

  return (
    <div className="w-full bg-white rounded-3xl p-6 md:p-8 border border-rose-100 romantic-card-shadow relative overflow-hidden">
      {/* Decorative top accent */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              НАША ГОДОВЩИНА ЛЮБВИ
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-handwriting text-slate-800">
            История длиною в вечность
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-rose-50/80 px-3.5 py-1.5 rounded-2xl border border-rose-200 text-slate-700 text-xs sm:text-sm font-semibold">
            <Calendar className="w-4 h-4 text-rose-500" />
            <span>Начало: {startDateStr}</span>
          </div>

          {showAnniversaryBtn && (
            <button
              onClick={onOpenAnniversaryModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Поздравление 🎉</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Counter Display */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          МЫ ВМЕСТЕ УЖЕ:
        </p>

        <div className="flex flex-wrap items-baseline gap-2 sm:gap-4 mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-rose-500 tracking-tight font-sans">
              {elapsed.totalDays}
            </span>
            <span className="text-xl sm:text-2xl font-bold font-handwriting text-rose-400">
              дней
            </span>
          </div>

          <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-rose-500 tracking-tight font-sans">
            {elapsed.hours}:{elapsed.minutes}:{elapsed.seconds}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-400 italic">
          Это {elapsed.totalHours.toLocaleString('ru-RU')} часов, {elapsed.totalMinutes.toLocaleString('ru-RU')} минут любви и поддержки!
        </p>
      </div>

      {/* Countdown to Next Anniversary Container */}
      <div className="bg-rose-50/60 rounded-2xl p-5 border border-rose-200/80 mb-8">
        <p className="text-xs sm:text-sm font-bold text-rose-600 mb-3 flex items-center gap-1.5">
          <span>{nextAnniversary.title}</span>
        </p>

        <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
          <div className="bg-white py-2.5 px-1 sm:px-3 rounded-xl border border-rose-200 shadow-2xs">
            <span className="block text-lg sm:text-2xl font-extrabold text-rose-500 font-sans">
              {nextAnniversary.days}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold">ДН</span>
          </div>

          <div className="bg-white py-2.5 px-1 sm:px-3 rounded-xl border border-rose-200 shadow-2xs">
            <span className="block text-lg sm:text-2xl font-extrabold text-rose-500 font-sans">
              {nextAnniversary.hours}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold">ЧАС</span>
          </div>

          <div className="bg-white py-2.5 px-1 sm:px-3 rounded-xl border border-rose-200 shadow-2xs">
            <span className="block text-lg sm:text-2xl font-extrabold text-rose-500 font-sans">
              {nextAnniversary.minutes}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold">МИН</span>
          </div>

          <div className="bg-white py-2.5 px-1 sm:px-3 rounded-xl border border-rose-200 shadow-2xs">
            <span className="block text-lg sm:text-2xl font-extrabold text-rose-500 font-sans">
              {nextAnniversary.seconds}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold">СЕК</span>
          </div>
        </div>
      </div>

      {/* Grid of 4 Future Milestones */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {milestones.map((ms, idx) => (
          <div
            key={idx}
            className="bg-rose-50/40 hover:bg-rose-50/80 transition-colors p-3.5 rounded-2xl border border-rose-100/90 text-center"
          >
            <h4 className="text-xs sm:text-sm font-bold text-slate-700 mb-1">
              {ms.title}
            </h4>
            <p className="text-[11px] text-slate-400 font-medium mb-1.5">
              {ms.dateStr}
            </p>
            <span className="inline-block text-[11px] font-bold text-rose-500 bg-white px-2.5 py-0.5 rounded-full border border-rose-200 shadow-2xs">
              Осталось {ms.daysLeft} дн
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
