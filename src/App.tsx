import React, { useState, useEffect } from 'react';
import { PasswordMode, PhotoItem, QuoteItem, SongSettings } from './types';
import { DEFAULT_PHOTOS, DEFAULT_QUOTES, DEFAULT_SONG } from './data/defaultData';
import { subscribePhotos, subscribeQuotes } from './lib/firebase';
import { HeaderBar } from './components/HeaderBar';
import { TimeCounterCard } from './components/TimeCounterCard';
import { AudioPlayerCard } from './components/AudioPlayerCard';
import { PhotoGallery } from './components/PhotoGallery';
import { PasswordModal } from './components/PasswordModal';
import { AdminPanel } from './components/AdminPanel';
import { FooterSection } from './components/FooterSection';
import { AnniversaryModal } from './components/AnniversaryModal';
import { LoveReasonsJar } from './components/LoveReasonsJar';

export default function App() {
  const [mode, setMode] = useState<PasswordMode>(() => {
    const saved = sessionStorage.getItem('love_mode');
    return (saved as PasswordMode) || null;
  });

  const [photos, setPhotos] = useState<PhotoItem[]>(DEFAULT_PHOTOS);
  const [quotes, setQuotes] = useState<QuoteItem[]>(DEFAULT_QUOTES);
  const [song, setSong] = useState<SongSettings>(DEFAULT_SONG);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAnniversaryModalOpen, setIsAnniversaryModalOpen] = useState(false);

  // Subscribe to real-time Firebase Firestore updates
  useEffect(() => {
    const unsubPhotos = subscribePhotos((data) => {
      setPhotos(data || []);
    });

    const unsubQuotes = subscribeQuotes((data) => {
      if (data && data.length > 0) setQuotes(data);
    });

    return () => {
      if (unsubPhotos) unsubPhotos();
      if (unsubQuotes) unsubQuotes();
    };
  }, []);

  // Determine active start date according to password entered
  const getStartDateStr = (): string => {
    if (mode === '202917') return '14.07.2024';
    if (mode === '2029') return '01.09.2024';
    if (mode === '525252') return '14.07.2024'; // Admin mode default
    return '14.07.2024';
  };

  const activeStartDate = getStartDateStr();

  // Calculate duration string (e.g. "2 ГОДА ВМЕСТЕ!") and years number
  const getYearsCount = (): number => {
    const parts = activeStartDate.split('.');
    if (parts.length === 3) {
      const start = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      const now = new Date();
      return Math.max(1, now.getFullYear() - start.getFullYear());
    }
    return 2;
  };

  const getYearsTogetherText = (): string => {
    const years = getYearsCount();
    return `${years} ГОДА ВМЕСТЕ!`;
  };

  // Check if today is exact anniversary day (matching date and month)
  const checkIsAnniversaryDay = (): boolean => {
    const parts = activeStartDate.split('.');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const now = new Date();
      return now.getDate() === day && now.getMonth() === month;
    }
    return false;
  };

  const isAnniversaryDay = checkIsAnniversaryDay() || mode === '525252';

  const handlePasswordSuccess = (selectedMode: PasswordMode) => {
    setMode(selectedMode);
    if (selectedMode) {
      sessionStorage.setItem('love_mode', selectedMode);
    }
    if (selectedMode === '525252') {
      setIsAdminModalOpen(true);
    }
  };

  const handleLockSession = () => {
    setMode(null);
    sessionStorage.removeItem('love_mode');
  };

  return (
    <div className="min-h-screen bg-[#FFF0F4] text-slate-800 flex flex-col font-sans">
      {/* Password Modal if unauthenticated */}
      <PasswordModal
        isOpen={mode === null}
        onSuccess={handlePasswordSuccess}
      />

      {/* Main Content Area */}
      {mode !== null && (
        <>
          {/* Header Bar */}
          <HeaderBar
            mode={mode}
            startDate={activeStartDate}
            yearsTogetherText={getYearsTogetherText()}
            onOpenLock={handleLockSession}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            onOpenAnniversaryModal={() => setIsAnniversaryModalOpen(true)}
            showAnniversaryBtn={isAnniversaryDay}
          />

          {/* Admin Banner Indicator */}
          {mode === '525252' && (
            <div className="w-full bg-amber-500 text-white py-1.5 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-inner">
              <span>🔑 Режим администратора активен. Все добавленные фото сохраняются на Firebase!</span>
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="underline hover:text-amber-100 cursor-pointer"
              >
                [Открыть форму добавления]
              </button>
            </div>
          )}

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Top Grid: Time Counter (Left) & Audio Player (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2">
                <TimeCounterCard
                  mode={mode}
                  startDateStr={activeStartDate}
                  onOpenAnniversaryModal={() => setIsAnniversaryModalOpen(true)}
                  showAnniversaryBtn={isAnniversaryDay}
                />
              </div>

              <div className="lg:col-span-1 space-y-6">
                <AudioPlayerCard song={song} />
                <LoveReasonsJar />
              </div>
            </div>

            {/* Photo Gallery Section */}
            <PhotoGallery
              photos={photos}
              isAdmin={mode === '525252'}
              onOpenAddModal={() => setIsAdminModalOpen(true)}
            />
          </main>

          {/* Footer Section */}
          <FooterSection yearsText={getYearsTogetherText()} />

          {/* Admin Modal */}
          <AdminPanel
            isOpen={isAdminModalOpen}
            onClose={() => setIsAdminModalOpen(false)}
          />

          {/* Anniversary Celebration Modal */}
          <AnniversaryModal
            isOpen={isAnniversaryModalOpen}
            onClose={() => setIsAnniversaryModalOpen(false)}
            yearsTogether={getYearsCount()}
            startDateStr={activeStartDate}
          />
        </>
      )}
    </div>
  );
}
