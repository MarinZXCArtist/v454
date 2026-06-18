import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Calendar, Sparkles, Quote, Lock } from 'lucide-react';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './lib/firebase';

import { PhotoMemory } from './types';
import { initialPhotoMemories } from './data';

import PasswordScreen from './components/PasswordScreen';
import MusicPlayer from './components/MusicPlayer';
import PhotoSection from './components/PhotoSection';

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [siteOpenChecked, setSiteOpenChecked] = useState(false);
  const [siteOpen, setSiteOpen] = useState(false);

  const girlName = 'Диана';
  const boyName = 'Марин';

  const [photos, setPhotos] = useState<PhotoMemory[]>(() => {
    const local = localStorage.getItem('anniv_photos');
    return local ? JSON.parse(local) : initialPhotoMemories;
  });

  // Check if site is open (no password needed)
  useEffect(() => {
    const checkSiteAccess = async () => {
      try {
        const ref = doc(db, 'settings', 'siteAccess');
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().open === true) {
          setSiteOpen(true);
          setUnlocked(true);
          setIsAdmin(false);
        }
      } catch {}
      setSiteOpenChecked(true);
    };
    checkSiteAccess();
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    const syncPhotos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'photos'));
        const loaded: PhotoMemory[] = [];
        querySnapshot.forEach((docSnapshot) => {
          loaded.push({ id: docSnapshot.id, ...docSnapshot.data() } as PhotoMemory);
        });
        if (loaded.length > 0) {
          setPhotos(loaded);
        } else {
          setPhotos(initialPhotoMemories);
          for (const item of initialPhotoMemories) {
            await setDoc(doc(db, 'photos', item.id), item);
          }
        }
      } catch (err) {
        console.error('Failed to load photos from Firestore:', err);
      }
    };
    syncPhotos();
  }, [unlocked]);

  const [clickParticles, setClickParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [daysTogether, setDaysTogether] = useState(0);
  const [timeTogetherString, setTimeTogetherString] = useState({ hours: 0, mins: 0, secs: 0 });
  const [countdownString, setCountdownString] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [nextAnnivNumber, setNextAnnivNumber] = useState(2);
  const [nextAnnivDateStr, setNextAnnivDateStr] = useState('14.07.2026');
  const [isAnniversaryDay, setIsAnniversaryDay] = useState(false);
  const [currentYearsTogether, setCurrentYearsTogether] = useState(2);

  const getYearsWord = (n: number) => {
    const r10 = n % 10, r100 = n % 100;
    if (r10 === 1 && r100 !== 11) return 'год';
    if (r10 >= 2 && r10 <= 4 && (r100 < 10 || r100 >= 20)) return 'года';
    return 'лет';
  };

  useEffect(() => {
    localStorage.setItem('anniv_photos', JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    const startDate = new Date('2024-07-14T00:00:00');
    const updateTimers = () => {
      const now = new Date();
      const diffMs = now.getTime() - startDate.getTime();
      const dTogether = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      setDaysTogether(dTogether);
      setTimeTogetherString({ hours: Math.floor((diffMs / (1000 * 60 * 60)) % 24), mins: Math.floor((diffMs / (1000 * 60)) % 60), secs: Math.floor((diffMs / 1000) % 60) });
      let yearsNow = now.getFullYear() - 2024;
      if (now.getTime() < new Date(now.getFullYear(), 6, 14, 0, 0, 0).getTime()) yearsNow -= 1;
      setCurrentYearsTogether(Math.max(0, yearsNow));
      setIsAnniversaryDay(now.getMonth() === 6 && now.getDate() === 14);
      const currentYear = now.getFullYear();
      let annivYear = currentYear;
      let nextAnnivDate = new Date(annivYear, 6, 14, 0, 0, 0);
      if (now.getTime() >= nextAnnivDate.getTime()) { annivYear = currentYear + 1; nextAnnivDate = new Date(annivYear, 6, 14, 0, 0, 0); }
      setNextAnnivNumber(annivYear - 2024);
      setNextAnnivDateStr(`14.07.${annivYear}`);
      const cd = nextAnnivDate.getTime() - now.getTime();
      setCountdownString({ days: Math.max(0, Math.floor(cd / (1000 * 60 * 60 * 24))), hours: Math.max(0, Math.floor((cd / (1000 * 60 * 60)) % 24)), mins: Math.max(0, Math.floor((cd / (1000 * 60)) % 60)), secs: Math.max(0, Math.floor((cd / 1000) % 60)) });
    };
    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleScreenClick = (e: React.MouseEvent) => {
    const id = Date.now() + Math.random();
    setClickParticles((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => setClickParticles((prev) => prev.filter((p) => p.id !== id)), 1000);
  };

  const handleAddPhoto = async (p: PhotoMemory) => {
    try { await setDoc(doc(db, 'photos', p.id), p); } catch (err) { console.error(err); }
    setPhotos((prev) => [p, ...prev]);
  };

  const handleDeletePhoto = async (id: string) => {
    try { await deleteDoc(doc(db, 'photos', id)); } catch (err) { console.error(err); }
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleLikePhoto = async (id: string) => {
    setPhotos((prev) => prev.map((p) => {
      if (p.id === id) {
        const updatedLikes = p.likes + 1;
        updateDoc(doc(db, 'photos', id), { likes: updatedLikes }).catch(console.error);
        return { ...p, likes: updatedLikes };
      }
      return p;
    }));
  };

  // While checking site access
  if (!siteOpenChecked) {
    return <div className="min-h-screen flex items-center justify-center bg-rose-50"><Heart className="text-rose-400 animate-pulse fill-rose-300" size={48} /></div>;
  }

  if (!unlocked) {
    return <PasswordScreen onUnlock={(admin) => { setUnlocked(true); setIsAdmin(admin); }} />;
  }

  return (
    <div onClick={handleScreenClick} className="min-h-screen bg-gradient-to-tr from-[#FFF5F5] via-[#FFF2F4] to-[#FFF9FB] flex flex-col relative font-sans text-stone-800">
      <div className="fixed inset-0 pointer-events-none z-50">
        <AnimatePresence>
          {clickParticles.map((p) => (
            <motion.div key={p.id} initial={{ opacity: 1, scale: 0.8, x: p.x - 12, y: p.y - 12 }} animate={{ opacity: 0, scale: 1.5, y: p.y - 80, rotate: Math.random() * 40 - 20 }} exit={{ opacity: 0 }} className="absolute text-rose-500 pointer-events-none">
              <Heart className="fill-rose-500" size={24} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute top-12 left-6 text-pink-200 pointer-events-none animate-pulse"><Sparkles size={32} /></div>
      <div className="absolute top-48 right-12 text-pink-200 pointer-events-none animate-pulse delay-500"><Sparkles size={24} /></div>

      <header className="border-b border-pink-100 bg-white/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-400 text-white rounded-full"><Heart className="fill-white" size={18} /></div>
            <h1 className="font-serif text-lg font-bold text-rose-500 tracking-tight">{boyName} + {girlName}</h1>
            <span className="text-[10px] bg-rose-100 text-rose-600 font-bold px-2 py-0.5 rounded-full uppercase">{currentYearsTogether} {getYearsWord(currentYearsTogether)} Вместе!</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-rose-500 font-bold flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-full border border-pink-100 shadow-sm">
              <span>Люблю тебя сильно! ❤️</span>
            </div>
            <button onClick={() => { setUnlocked(false); setIsAdmin(false); }} className="p-1.5 hover:bg-neutral-100 text-stone-500 hover:text-rose-500 rounded-full transition-colors border border-neutral-200/60 shadow-sm" title="Заблокировать экран">
              <Lock size={15} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-10 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-pink-100 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50/50 rounded-full blur-3xl -z-10"></div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-rose-50 pb-4">
              <div>
                <span className="text-[10px] tracking-wider uppercase font-bold text-rose-400 font-mono">наша годовщина любви</span>
                <h2 className="text-3xl font-bold tracking-tight text-gray-800 font-serif mt-0.5">История длиною в вечность</h2>
              </div>
              <span className="text-xs font-bold text-stone-500 flex items-center gap-1 bg-neutral-100 rounded-full px-3 py-1"><Calendar size={12} /><span>Начало: 14.07.2024</span></span>
            </div>
            <div className="py-6 space-y-2">
              <span className="text-xs uppercase font-extrabold text-stone-400 font-mono tracking-wider">Мы вместе уже:</span>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black text-rose-500 tracking-tight font-serif">{daysTogether}</span>
                <span className="text-xl font-bold text-stone-600 font-serif">дней</span>
                <span className="text-4xl font-extrabold text-rose-400 font-mono pl-2">{timeTogetherString.hours.toString().padStart(2, '0')}:{timeTogetherString.mins.toString().padStart(2, '0')}:{timeTogetherString.secs.toString().padStart(2, '0')}</span>
              </div>
              <p className="text-xs text-gray-400 italic">Это {daysTogether * 24} часов, {daysTogether * 24 * 60} минут любви!</p>
            </div>
            <div className="bg-pink-50/50 rounded-2xl p-4 border border-pink-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wide">{isAnniversaryDay ? 'Наша Годовщина Наступила! 🎉' : `До нашей ${nextAnnivNumber}-й годовщины (${nextAnnivDateStr}):`}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">{isAnniversaryDay ? 'Поздравляем со счастливым праздником!' : 'Важная веха нашего совместного пути'}</p>
              </div>
              {isAnniversaryDay ? (
                <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-xs rounded-xl shadow-md animate-bounce">🎉 ГОДОВЩИНА! НАМ {currentYearsTogether} {getYearsWord(currentYearsTogether)} ЛЮБВИ! 🎉</div>
              ) : (
                <div className="flex gap-2">
                  {[['days', 'Дн'], ['hours', 'Час'], ['mins', 'Мин'], ['secs', 'Сек']].map(([key, label]) => (
                    <div key={key} className="text-center bg-white border border-pink-100 rounded-xl px-2.5 py-1 min-w-[50px]">
                      <span className="block text-sm font-black text-rose-500 font-mono">{countdownString[key as keyof typeof countdownString]}</span>
                      <span className="text-[8px] uppercase tracking-wider text-gray-400 font-mono">{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-dashed border-rose-100/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] text-gray-500 font-mono">
              {[{ label: '1000 Дней Вместе', date: '10.04.2027', days: 1000 }, { label: '3 Года в любви', date: '14.07.2027', days: 1095 }, { label: '5 Лет Вместе', date: '14.07.2029', days: 1826 }, { label: '10 Лет Счастья', date: '14.07.2034', days: 3652 }].map((m) => (
                <div key={m.label} className="p-2 bg-rose-50/30 rounded-xl border border-pink-50">
                  <span className="block font-bold text-rose-500 mb-0.5">{m.label}</span>
                  <span className="text-gray-400 block mb-0.5">{m.date}</span>
                  <span className="bg-rose-100 text-rose-600 font-bold px-1 rounded-full font-sans text-[9px]">{daysTogether >= m.days ? '✅ Пройдено' : `Осталось ${m.days - daysTogether} дн`}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <MusicPlayer isAdmin={isAdmin} />
          </div>
        </div>

        <div className="bg-white/30 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-pink-50 shadow-inner">
          <PhotoSection photos={photos} onAddPhoto={handleAddPhoto} onDeletePhoto={handleDeletePhoto} onLikePhoto={handleLikePhoto} isAdmin={isAdmin} />
        </div>
      </main>

      <footer className="border-t border-pink-100 bg-white/40 backdrop-blur-md py-8 text-center mt-12">
        <div className="max-w-md mx-auto px-4 space-y-3.5">
          <Quote className="text-rose-400 mx-auto fill-rose-50" size={24} />
          <p className="font-serif text-lg text-stone-600 font-semibold italic">«Любить кого-то — значит видеть чудо, невидимое для других...»</p>
          <div className="text-xs text-rose-400 font-bold font-mono">{boyName} ♥ {girlName} • {currentYearsTogether} {getYearsWord(currentYearsTogether)} счастливых отношений</div>
        </div>
      </footer>
    </div>
  );
}
