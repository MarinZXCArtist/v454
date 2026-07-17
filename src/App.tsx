import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Calendar,
  Sparkles,
  Quote,
  Lock
} from 'lucide-react';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { dbContainer, dbDefault, dbNamed, dbOld } from './lib/firebase';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Data and types imports
import { PhotoMemory } from './types';
import { initialPhotoMemories } from './data';

// Component imports
import PasswordScreen from './components/PasswordScreen';
import MusicPlayer from './components/MusicPlayer';
import PhotoSection from './components/PhotoSection';

export default function App() {
  // Session Access Verification State
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return localStorage.getItem('anniv_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem('anniv_is_admin') === 'true';
    } catch {
      return false;
    }
  });
  const [useAlternateDate, setUseAlternateDate] = useState(() => {
    try {
      return localStorage.getItem('anniv_use_alternate_date') === 'true';
    } catch {
      return false;
    }
  });

  // Core Static Personalization Names
  const girlName = 'Диана';
  const boyName = 'Марин';

  const startDateObj = new Date(2024, useAlternateDate ? 8 : 6, useAlternateDate ? 1 : 14, 0, 0, 0);

  const thousandDaysDate = new Date(startDateObj.getTime() + 1000 * 24 * 60 * 60 * 1000);
  const thousandDaysStr = `${thousandDaysDate.getDate().toString().padStart(2, '0')}.${(thousandDaysDate.getMonth() + 1).toString().padStart(2, '0')}.${thousandDaysDate.getFullYear()}`;

  const threeYearsDate = new Date(startDateObj.getFullYear() + 3, startDateObj.getMonth(), startDateObj.getDate());
  const threeYearsStr = `${threeYearsDate.getDate().toString().padStart(2, '0')}.${(threeYearsDate.getMonth() + 1).toString().padStart(2, '0')}.${threeYearsDate.getFullYear()}`;

  const fiveYearsDate = new Date(startDateObj.getFullYear() + 5, startDateObj.getMonth(), startDateObj.getDate());
  const fiveYearsStr = `${fiveYearsDate.getDate().toString().padStart(2, '0')}.${(fiveYearsDate.getMonth() + 1).toString().padStart(2, '0')}.${fiveYearsDate.getFullYear()}`;

  const tenYearsDate = new Date(startDateObj.getFullYear() + 10, startDateObj.getMonth(), startDateObj.getDate());
  const tenYearsStr = `${tenYearsDate.getDate().toString().padStart(2, '0')}.${(tenYearsDate.getMonth() + 1).toString().padStart(2, '0')}.${tenYearsDate.getFullYear()}`;

  // Interactive local states (preloaded or from localStorage)
  const [photos, setPhotos] = useState<PhotoMemory[]>(() => {
    try {
      const local = localStorage.getItem('anniv_photos');
      return local ? JSON.parse(local) : [];
    } catch (e) {
      console.warn('LocalStorage reads are blocked or restricted on this device:', e);
      return [];
    }
  });

  // Load photos from Firestore in real-time on mount
  useEffect(() => {
    const syncPhotos = async () => {
      // We will try these databases in order of preference to locate existing photos:
      const dbsToTry = [
        { instance: dbOld, name: 'dbOld' },
        { instance: dbNamed, name: 'dbNamed' },
        { instance: dbDefault, name: 'dbDefault' }
      ];

      for (const dbObj of dbsToTry) {
        try {
          if (!dbObj.instance) continue;
          const querySnapshot = await getDocs(collection(dbObj.instance, 'photos'));
          const loaded: PhotoMemory[] = [];
          querySnapshot.forEach((docSnapshot) => {
            loaded.push({ id: docSnapshot.id, ...docSnapshot.data() } as PhotoMemory);
          });

          if (loaded.length > 0) {
            dbContainer.current = dbObj.instance;
            loaded.sort((a, b) => {
              const numA = Number(a.id) || 0;
              const numB = Number(b.id) || 0;
              return numB - numA;
            });
            setPhotos(loaded);
            console.log(`Successfully synced photos from ${dbObj.name}`);
            return;
          }
        } catch (e) {
          console.warn(`Could not sync from database ${dbObj.name}:`, e);
        }
      }

      // If absolutely everything is empty, default to dbOld so they write to dbOld.
      // We do NOT clear the state to empty, we keep initialPhotoMemories/local photos,
      // and we automatically seed initialPhotoMemories to dbOld in the background!
      dbContainer.current = dbOld;
      console.log('All Firestore databases are empty. Seeding initial photo memories to dbOld...');
      for (const p of initialPhotoMemories) {
        setDoc(doc(dbOld, 'photos', p.id), p).catch(err => {
          console.error(`Failed to seed photo ${p.id} to Firestore:`, err);
        });
      }
    };
    
    syncPhotos();
  }, []);

  // Cursor heart click particles
  const [clickParticles, setClickParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  // Time Counters and Dynamic Anniversary metrics
  const [daysTogether, setDaysTogether] = useState(0);
  const [timeTogetherString, setTimeTogetherString] = useState({ hours: 0, mins: 0, secs: 0 });
  const [countdownString, setCountdownString] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [nextAnnivNumber, setNextAnnivNumber] = useState(2);
  const [nextAnnivDateStr, setNextAnnivDateStr] = useState('14.07.2026');
  const [isAnniversaryDay, setIsAnniversaryDay] = useState(false);
  const [currentYearsTogether, setCurrentYearsTogether] = useState(2);

  const getYearsWord = (n: number) => {
    const remainder10 = n % 10;
    const remainder100 = n % 100;
    if (remainder10 === 1 && remainder100 !== 11) {
      return 'год';
    }
    if (remainder10 >= 2 && remainder10 <= 4 && (remainder100 < 10 || remainder100 >= 20)) {
      return 'года';
    }
    return 'лет';
  };

  // Save photos to localStorage automatically as quick-load local fallback cache
  useEffect(() => {
    try {
      localStorage.setItem('anniv_photos', JSON.stringify(photos));
    } catch (e) {
      console.warn('LocalStorage writes are blocked or restricted on this device:', e);
    }
  }, [photos]);

  // Dynamic Timers and Anniversary thread
  useEffect(() => {
    // Start dating date: 1 September 2024 (useAlternateDate = true) or 14 July 2024 (useAlternateDate = false)
    const annivMonth = useAlternateDate ? 8 : 6; // Month: 0-indexed (8 = September, 6 = July)
    const annivDay = useAlternateDate ? 1 : 14;
    const startDate = new Date(2024, annivMonth, annivDay, 0, 0, 0);

    const updateTimers = () => {
      const now = new Date();

      // 1. Calculate count-UP (How long together since start date)
      const diffMs = now.getTime() - startDate.getTime();
      const dTogether = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hoursTogether = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minsTogether = Math.floor((diffMs / (1000 * 60)) % 60);
      const secsTogether = Math.floor((diffMs / 1000) % 60);

      setDaysTogether(dTogether);
      setTimeTogetherString({ hours: hoursTogether, mins: minsTogether, secs: secsTogether });

      // 2. Determine exact full years together today
      let yearsNow = now.getFullYear() - 2024;
      const annivThisYear = new Date(now.getFullYear(), annivMonth, annivDay, 0, 0, 0);
      if (now.getTime() < annivThisYear.getTime()) {
        yearsNow -= 1;
      }
      setCurrentYearsTogether(Math.max(0, yearsNow));

      // 3. Determine if today is exactly the anniversary day
      const isAnnivDay = now.getMonth() === annivMonth && now.getDate() === annivDay;
      setIsAnniversaryDay(isAnnivDay);

      // 4. Calculate next anniversary dynamically
      const currentYear = now.getFullYear();
      let annivYear = currentYear;
      let nextAnnivDate = new Date(annivYear, annivMonth, annivDay, 0, 0, 0);

      // If we are past anniversary of current year, the upcoming is next year
      if (now.getTime() >= nextAnnivDate.getTime()) {
        annivYear = currentYear + 1;
        nextAnnivDate = new Date(annivYear, annivMonth, annivDay, 0, 0, 0);
      }

      setNextAnnivNumber(annivYear - 2024);
      
      const padDay = annivDay.toString().padStart(2, '0');
      const padMonth = (annivMonth + 1).toString().padStart(2, '0');
      setNextAnnivDateStr(`${padDay}.${padMonth}.${annivYear}`);

      // 5. Calculate countdown
      const countdownDiff = nextAnnivDate.getTime() - now.getTime();
      const cDays = Math.floor(countdownDiff / (1000 * 60 * 60 * 24));
      const cHours = Math.floor((countdownDiff / (1000 * 60 * 60)) % 24);
      const cMins = Math.floor((countdownDiff / (1000 * 60)) % 60);
      const cSecs = Math.floor((countdownDiff / 1000) % 60);

      setCountdownString({
        days: Math.max(0, cDays),
        hours: Math.max(0, cHours),
        mins: Math.max(0, cMins),
        secs: Math.max(0, cSecs)
      });
    };

    updateTimers();
    const intervalRef = setInterval(updateTimers, 1000);
    return () => clearInterval(intervalRef);
  }, [useAlternateDate]);

  // Click-to-spawn cursor hearts
  const handleScreenClick = (e: React.MouseEvent) => {
    const id = Date.now() + Math.random();
    setClickParticles((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => {
      setClickParticles((prev) => prev.filter((p) => p.id !== id));
    }, 1000);
  };

  const handleAddPhoto = async (p: PhotoMemory) => {
    // 1. Instantly update UI and local state optimistically
    setPhotos((prev) => [p, ...prev]);

    // 2. Write to Firestore in background without blocking the UI
    try {
      await setDoc(doc(dbContainer.current, 'photos', p.id), p);
    } catch (err) {
      console.error('Error saving new photo to Firestore:', err);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    // 1. Instantly remove card from UI and local state optimistically
    setPhotos((prev) => prev.filter((p) => p.id !== id));

    // 2. Perform delete in Firestore in background
    try {
      await deleteDoc(doc(dbContainer.current, 'photos', id));
    } catch (err) {
      console.error('Error deleting photo from Firestore:', err);
    }
  };

  const handleLikePhoto = async (id: string) => {
    try {
      setPhotos((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            const updatedLikes = p.likes + 1;
            // Async background update in FB
            updateDoc(doc(dbContainer.current, 'photos', id), { likes: updatedLikes }).catch(e => console.error(e));
            return { ...p, likes: updatedLikes };
          }
          return p;
        })
      );
    } catch (err) {
      console.error('Error liking photo:', err);
    }
  };

  // Render Password Lock as default shield
  if (!unlocked) {
    return (
      <PasswordScreen
        onUnlock={(passwordUsed) => {
          setUnlocked(true);
          try {
            localStorage.setItem('anniv_unlocked', 'true');
          } catch {}

          if (passwordUsed === '525252') {
            setIsAdmin(true);
            try {
              localStorage.setItem('anniv_is_admin', 'true');
            } catch {}
          } else {
            setIsAdmin(false);
            try {
              localStorage.setItem('anniv_is_admin', 'false');
            } catch {}
          }

          if (passwordUsed === '2029') {
            setUseAlternateDate(true);
            try {
              localStorage.setItem('anniv_use_alternate_date', 'true');
            } catch {}
          } else {
            setUseAlternateDate(false);
            try {
              localStorage.setItem('anniv_use_alternate_date', 'false');
            } catch {}
          }
        }}
      />
    );
  }

  return (
    <div
      onClick={handleScreenClick}
      className="min-h-screen bg-gradient-to-tr from-[#FFF5F5] via-[#FFF2F4] to-[#FFF9FB] flex flex-col relative font-sans text-stone-800"
      id="main-app-viewport"
    >
      <Analytics />
      <SpeedInsights />

      {/* Click Particles Engine */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <AnimatePresence>
          {clickParticles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, scale: 0.8, x: p.x - 12, y: p.y - 12 }}
              animate={{ opacity: 0, scale: 1.5, y: p.y - 80, rotate: Math.random() * 40 - 20 }}
              exit={{ opacity: 0 }}
              className="absolute text-rose-500 pointer-events-none"
            >
              <Heart className="fill-rose-500" size={24} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Sparkling Star Backdrops */}
      <div className="absolute top-12 left-6 text-pink-200 pointer-events-none animate-pulse">
        <Sparkles size={32} />
      </div>
      <div className="absolute top-48 right-12 text-pink-200 pointer-events-none animate-pulse delay-500">
        <Sparkles size={24} />
      </div>

      {/* Top Header Rail / Branding Banner */}
      <header className="border-b border-pink-100 bg-white/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-400 text-white rounded-full">
              <Heart className="fill-white" size={18} />
            </div>
            <h1 className="font-serif text-lg font-bold text-rose-500 tracking-tight glow-romantic">
              {boyName} + {girlName}
            </h1>
            <span className="text-[10px] bg-rose-100 text-rose-600 font-bold px-2 py-0.5 rounded-full uppercase">
              {currentYearsTogether} {getYearsWord(currentYearsTogether)} Вместе!
            </span>
          </div>
          {/* Sweet sentiment banner and lock option */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <span className="text-[10px] bg-rose-100 text-rose-700 font-extrabold px-2.5 py-1 rounded-full uppercase border border-rose-200 shadow-sm">
                Админ ✨
              </span>
            )}
            <div className="text-xs text-rose-500 font-bold flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-full border border-pink-100 shadow-sm">
              <span>Люблю тебя сильно! ❤️</span>
            </div>
            <button
              onClick={() => {
                setUnlocked(false);
                setIsAdmin(false);
                setUseAlternateDate(false);
                try {
                  localStorage.setItem('anniv_unlocked', 'false');
                  localStorage.setItem('anniv_is_admin', 'false');
                  localStorage.setItem('anniv_use_alternate_date', 'false');
                } catch {}
              }}
              className="p-1.5 hover:bg-neutral-100 text-stone-500 hover:text-rose-500 rounded-full transition-colors border border-neutral-200/60 shadow-sm"
              title="Заблокировать экран"
              id="lock-screen-button"
            >
              <Lock size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Core Section */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-10 z-10">
        
        {/* Count-Up and Countdown Love Station (Hero Block) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Visual Clock Box */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-pink-100 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[300px]" id="love-clock-hero-panel">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50/50 rounded-full blur-3xl -z-10"></div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-rose-50 pb-4">
              <div>
                <span className="text-[10px] tracking-wider uppercase font-bold text-rose-400 font-mono">
                  наша годовщина любви
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-gray-800 font-serif mt-0.5">
                  История длиною в вечность
                </h2>
              </div>
              <span className="text-xs font-bold text-stone-500 flex items-center gap-1 bg-neutral-100 rounded-full px-3 py-1">
                <Calendar size={12} />
                <span>Начало: {useAlternateDate ? '01.09.2024' : '14.07.2024'}</span>
              </span>
            </div>

            {/* COUNT-UP TIMER (Time together) */}
            <div className="py-6 space-y-2">
              <span className="text-xs uppercase font-extrabold text-stone-400 font-mono tracking-wider">
                Мы вместе уже:
              </span>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black text-rose-500 tracking-tight glow-romantic font-serif font-bold">
                  {daysTogether}
                </span>
                <span className="text-xl font-bold text-stone-600 font-serif">дней</span>
                <span className="text-4xl font-extrabold text-rose-400 font-mono pl-2">
                  {timeTogetherString.hours.toString().padStart(2, '0')}:
                  {timeTogetherString.mins.toString().padStart(2, '0')}:
                  {timeTogetherString.secs.toString().padStart(2, '0')}
                </span>
              </div>
              <p className="text-xs text-gray-400 italic" style={{ fontFamily: 'system-ui, sans-serif' }}>
                Это {daysTogether * 24} часов, {daysTogether * 24 * 60} минут любви и поддержки!
              </p>
            </div>

            {/* COUNTDOWN TIMER TO NEXT ANNIVERSARY */}
            <div className="bg-pink-50/50 rounded-2xl p-4 border border-pink-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wide">
                  {isAnniversaryDay ? 'Наша Годовщина Наступила! 🎉' : `До нашей ${nextAnnivNumber}-й годовщины отношений (${nextAnnivDateStr}):`}
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {isAnniversaryDay ? 'Поздравляем друг друга со счастливым праздником нашей любви!' : `Это важная веха нашего прекрасного совместного пути`}
                </p>
              </div>

              {isAnniversaryDay ? (
                <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-xs rounded-xl shadow-md animate-bounce">
                  🎉 ГОДОВЩИНА НАСТУПИЛА! НАМ СЕГОДНЯ {currentYearsTogether} {getYearsWord(currentYearsTogether)} ЛЮБВИ! 🎉
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="text-center bg-white border border-pink-100 rounded-xl px-2.5 py-1 min-w-[50px]">
                    <span className="block text-sm font-black text-rose-500 font-mono">{countdownString.days}</span>
                    <span className="text-[8px] uppercase tracking-wider text-gray-400 font-mono">Дн</span>
                  </div>
                  <div className="text-center bg-white border border-pink-100 rounded-xl px-2.5 py-1 min-w-[50px]">
                    <span className="block text-sm font-black text-rose-500 font-mono">{countdownString.hours}</span>
                    <span className="text-[8px] uppercase tracking-wider text-gray-400 font-mono">Час</span>
                  </div>
                  <div className="text-center bg-white border border-pink-100 rounded-xl px-2.5 py-1 min-w-[50px]">
                    <span className="block text-sm font-black text-rose-500 font-mono">{countdownString.mins}</span>
                    <span className="text-[8px] uppercase tracking-wider text-gray-400 font-mono">Мин</span>
                  </div>
                  <div className="text-center bg-white border border-pink-100 rounded-xl px-2.5 py-1 min-w-[50px]">
                    <span className="block text-sm font-black text-rose-500 font-mono">{countdownString.secs}</span>
                    <span className="text-[8px] uppercase tracking-wider text-gray-400 font-mono">Сек</span>
                  </div>
                </div>
              )}
            </div>

            {/* FUTURE MILESTONES PREDICTOR FOR LONGEVITY */}
            <div className="mt-4 pt-4 border-t border-dashed border-rose-100/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] text-gray-500 font-mono">
              <div className="p-2 bg-rose-50/30 rounded-xl border border-pink-50">
                <span className="block font-bold text-rose-500 mb-0.5">1000 Дней Вместе</span>
                <span className="text-gray-400 block mb-0.5">{thousandDaysStr}</span>
                <span className="bg-rose-100 text-rose-600 font-bold px-1 py-0.2 rounded-full font-sans text-[9px]">
                  {daysTogether >= 1000 ? '✅ Пройдено' : `Осталось ${1000 - daysTogether} дн`}
                </span>
              </div>
              <div className="p-2 bg-rose-50/30 rounded-xl border border-pink-50">
                <span className="block font-bold text-rose-500 mb-0.5">3 Года в любви</span>
                <span className="text-gray-400 block mb-0.5">{threeYearsStr}</span>
                <span className="bg-rose-100 text-rose-600 font-bold px-1 py-0.2 rounded-full font-sans text-[9px]">
                  {daysTogether >= 1095 ? '✅ Пройдено' : `Осталось ${1095 - daysTogether} дн`}
                </span>
              </div>
              <div className="p-2 bg-rose-50/30 rounded-xl border border-pink-50">
                <span className="block font-bold text-rose-500 mb-0.5">5 Лет Вместе</span>
                <span className="text-gray-400 block mb-0.5">{fiveYearsStr}</span>
                <span className="bg-rose-100 text-rose-600 font-bold px-1 py-0.2 rounded-full font-sans text-[9px]">
                  {daysTogether >= 1826 ? '✅ Пройдено' : `Осталось ${1826 - daysTogether} дн`}
                </span>
              </div>
              <div className="p-2 bg-rose-50/30 rounded-xl border border-pink-50">
                <span className="block font-bold text-rose-500 mb-0.5">10 Лет Счастья</span>
                <span className="text-gray-400 block mb-0.5">{tenYearsStr}</span>
                <span className="bg-rose-100 text-rose-600 font-bold px-1 py-0.2 rounded-full font-sans text-[9px]">
                  {daysTogether >= 3652 ? '✅ Пройдено' : `Осталось ${3652 - daysTogether} дн`}
                </span>
              </div>
            </div>
          </div>

          {/* Spliced Audio Synthesis Player Column */}
          <div className="lg:col-span-1">
            <MusicPlayer />
          </div>

        </div>

        {/* Our Consolidated Memories Panel "Мы" */}
        <div className="bg-white/30 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-pink-50 shadow-inner">
          <PhotoSection
            photos={photos}
            onAddPhoto={handleAddPhoto}
            onDeletePhoto={handleDeletePhoto}
            onLikePhoto={handleLikePhoto}
            isAdmin={isAdmin}
          />
        </div>

      </main>

      {/* Romantic Footer Callout */}
      <footer className="border-t border-pink-100 bg-white/40 backdrop-blur-md py-8 text-center mt-12">
        <div className="max-w-md mx-auto px-4 space-y-3.5">
          <Quote className="text-rose-400 mx-auto fill-rose-50" size={24} />
          <p className="font-serif text-lg text-stone-600 font-semibold italic">
            «Любить кого-то — значит видеть чудо, невидимое для других... И наши совместные моменты — тому доказательство!»
          </p>
          <div className="text-xs text-rose-400 font-bold font-mono">
            {boyName} ♥ {girlName} • {currentYearsTogether} {getYearsWord(currentYearsTogether)} счастливых отношений в любви
          </div>
        </div>
      </footer>
    </div>
  );
}
