import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, Heart, Sparkles } from 'lucide-react';
import { SongSettings } from '../types';

interface AudioPlayerCardProps {
  song: SongSettings;
}

export const AudioPlayerCard: React.FC<AudioPlayerCardProps> = ({ song }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log('Audio autoplay blocked:', err));
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    if (dur) {
      setProgress((current / dur) * 100);
      setCurrentTime(formatTime(current));
      setDuration(formatTime(dur));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setProgress(newProgress);
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 border border-rose-100 romantic-card-shadow flex flex-col sm:flex-row items-center gap-6">
      <audio
        ref={audioRef}
        src={song.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Spinning Vinyl Record Container */}
      <div className="relative shrink-0">
        <div
          className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-900 border-4 border-slate-800 shadow-xl flex items-center justify-center relative overflow-hidden transition-transform duration-700 ${
            isPlaying ? 'animate-spin-slow' : ''
          }`}
        >
          {/* Vinyl Grooves */}
          <div className="absolute inset-2 rounded-full border border-slate-700/50" />
          <div className="absolute inset-5 rounded-full border border-slate-700/40" />
          <div className="absolute inset-8 rounded-full border border-slate-700/30" />

          {/* Vinyl Pink Center Hub */}
          <div className="w-10 h-10 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center shadow-inner z-10">
            <Heart className="w-5 h-5 text-white fill-white animate-pulse" />
          </div>
        </div>

        {/* Small Music Note Badge */}
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white">
          <Music className="w-4 h-4" />
        </div>
      </div>

      {/* Song Info & Player Controls */}
      <div className="flex-1 w-full text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 text-rose-600 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Наша особенная песня</span>
        </div>

        <h3 className="text-sm sm:text-base font-bold text-slate-800 font-sans mb-1 line-clamp-2 leading-snug">
          {song.artist} — {song.title} <span className="text-rose-500 inline-block ml-1">❤️</span>
        </h3>

        {/* Progress Bar */}
        <div className="mt-3 mb-3">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full h-1.5 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-1">
            <span>{currentTime}</span>
            <span>{duration}</span>
          </div>
        </div>

        {/* Player Controls Row */}
        <div className="flex items-center justify-center sm:justify-start gap-4">
          <button
            onClick={togglePlay}
            className="w-11 h-11 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-20 h-1.5 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
