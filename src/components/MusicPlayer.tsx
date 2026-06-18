import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, Sparkles, Heart, Disc } from 'lucide-react';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [heartBubbles, setHeartBubbles] = useState<{ id: number; x: number; y: number }[]>([]);

  const mp3Src = '/music/music.mp3';
  const mp3FileName = 'Макс Корж — Тает дым';

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Sync volume with MP3 audio player
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle autoplay and user gesture bypass
  useEffect(() => {
    let playTimeout = setTimeout(() => {
      if (audioPlayerRef.current && isPlaying) {
        audioPlayerRef.current.play().catch((err) => {
          console.log("Playback blocked by browser until first interaction.");
        });
      }
    }, 500);

    const handleGesture = () => {
      if (audioPlayerRef.current && isPlaying && audioPlayerRef.current.paused) {
        audioPlayerRef.current.play().catch(() => {});
      }
    };
    window.addEventListener('click', handleGesture);
    return () => {
      clearTimeout(playTimeout);
      window.removeEventListener('click', handleGesture);
    };
  }, [isPlaying]);

  // Spawns floating hearts over the vinyl
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      spawnHeartBubble();
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle MP3 Time Update
  const handleTimeUpdate = () => {
    if (audioPlayerRef.current) {
      const current = audioPlayerRef.current.currentTime;
      const total = audioPlayerRef.current.duration;
      if (total) {
        setProgress((current / total) * 100);
      }
    }
  };

  const handleAudioEnded = () => {
    // Loop the player by default
    if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
        setIsPlaying(false);
      } else {
        audioPlayerRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.error("Audio playback error:", err);
        });
      }
    }
  };

  const spawnHeartBubble = () => {
    const id = Date.now() + Math.random();
    const x = 20 + Math.random() * 60;
    const y = 10 + Math.random() * 40;
    setHeartBubbles((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setHeartBubbles((prev) => prev.filter((h) => h.id !== id));
    }, 2000);
  };

  return (
    <div
      className="p-5 bg-white/50 backdrop-blur-md rounded-3xl border border-pink-100 shadow-xl relative overflow-hidden"
      id="cozy-vinyl-music-player"
    >
      {/* Hidden Audio Player */}
      <audio
        ref={audioPlayerRef}
        src={mp3Src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
        preload="auto"
        autoPlay
      />

      {/* Visual floating hearts inside player */}
      <AnimatePresence>
        {heartBubbles.map((h) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 0, scale: 0.5, x: `${h.x}%`, y: '80%' }}
            animate={{ opacity: 0.8, scale: 1.2, y: `${h.y}%` }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute pointer-events-none text-rose-400 z-20"
          >
            <Heart className="fill-rose-300" size={14} />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row items-center gap-5">
        {/* Spinning Vinyl Record Disk */}
        <div className="relative">
          <motion.div
            animate={isPlaying ? { rotate: 360 } : {}}
            transition={
              isPlaying
                ? { repeat: Infinity, duration: 12, ease: 'linear' }
                : { duration: 0 }
            }
            className="w-24 h-24 rounded-full bg-stone-900 border-4 border-stone-800 flex items-center justify-center shadow-md relative cursor-pointer group"
            onClick={togglePlay}
          >
            {/* Grooves */}
            <div className="absolute inset-2 rounded-full border border-stone-800/40"></div>
            <div className="absolute inset-4 rounded-full border border-stone-800/40"></div>
            <div className="absolute inset-6 rounded-full border border-stone-800/40"></div>

            {/* Middle decorative label */}
            <div className="w-8 h-8 rounded-full bg-rose-100 border-4 border-stone-950 flex items-center justify-center relative overflow-hidden">
              <Disc className="text-rose-500 animate-spin-slow" size={14} />
            </div>

            {/* Heart hover icon */}
            <div className="absolute inset-0 rounded-full bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Heart className="fill-rose-200 text-white" size={20} />
            </div>
          </motion.div>

          {/* Vinyl Needle Arm decoration */}
          <motion.div
            animate={isPlaying ? { rotate: [12, 15, 12] } : { rotate: 0 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-1 -right-2 w-10 h-3 origin-left pointer-events-none hidden sm:block"
          >
            <div className="h-0.5 bg-neutral-400 w-8 rotate-[20deg]"></div>
          </motion.div>
        </div>

        {/* Tracks Content & Controls */}
        <div className="flex-1 w-full text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full text-[9px] font-semibold">
              <Sparkles size={8} />
              <span>Наша особенная песня</span>
            </span>
          </div>

          <h3 className="text-sm font-bold text-gray-800 tracking-tight truncate max-w-[200px] mx-auto sm:mx-0">
            {mp3FileName}
          </h3>
          <p className="text-[12px] text-rose-500 italic mb-2 h-4 truncate" style={{ fontFamily: 'system-ui, "Courier New", Courier, monospace' }}>
            {isPlaying ? '❤️' : '💔'}
          </p>

          {/* Timeline progress */}
          <div className="relative w-full h-1 bg-rose-100 rounded-full overflow-hidden mb-3">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'linear', duration: 0.5 }}
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"
            ></motion.div>
          </div>

          {/* Player controls */}
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <button
              onClick={togglePlay}
              className="p-1.5 bg-rose-400 hover:bg-rose-500 text-white rounded-full shadow-md flex items-center justify-center focus:outline-none transition-all active:scale-95 cursor-pointer"
              title={isPlaying ? 'Пауза' : 'Слушать'}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
            </button>

            {/* Sound Controller */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 text-rose-400 hover:text-rose-500 transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-12 h-1 bg-pink-100 accent-rose-400 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
