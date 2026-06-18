import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { Trophy, Award, Heart, HelpCircle, ArrowRight, RotateCcw, Share2, Sparkles, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuizSectionProps {
  questions: QuizQuestion[];
}

export default function QuizSection({ questions }: QuizSectionProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [girlName, setGirlName] = useState('');
  const [boyName, setBoyName] = useState('');
  const [certificateRevealed, setCertificateRevealed] = useState(false);

  const activeQuestion = questions[currentIdx];

  const handleOptionSelect = (optIndex: number) => {
    if (answered) return;
    setSelectedOpt(optIndex);
    setAnswered(true);

    if (optIndex === activeQuestion.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setAnswered(false);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((c) => c + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setCertificateRevealed(false);
  };

  return (
    <div
      className="p-6 md:p-8 bg-white/50 backdrop-blur-md rounded-3xl border border-pink-100 shadow-xl"
      id="love-harmony-quiz-section"
    >
      <AnimatePresence mode="wait">
        {!quizFinished ? (
          <motion.div
            key="quiz-body"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Header info */}
            <div className="flex justify-between items-center border-b border-pink-100 pb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="text-rose-500 animate-bounce" size={24} />
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Викторина «Наша Любовь» 🧩</h3>
                  <p className="text-xs text-gray-500">Насколько хорошо мы чувствуем друг друга?</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-bold font-mono">
                {currentIdx + 1} из {questions.length}
              </span>
            </div>

            {/* Question Text */}
            <div className="bg-rose-50/50 p-5 rounded-2xl border border-pink-50">
              <h2 className="text-lg font-bold text-gray-800 leading-snug">
                {activeQuestion.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {activeQuestion.options.map((option, idx) => {
                const isSelected = selectedOpt === idx;
                const isCorrect = idx === activeQuestion.correctIndex;
                const isWrongSelected = isSelected && !isCorrect;

                let btnStyles = 'border-gray-100 bg-white hover:border-rose-300 hover:bg-rose-50/20';

                if (answered) {
                  if (isCorrect) {
                    btnStyles = 'border-emerald-200 bg-emerald-50 text-emerald-800';
                  } else if (isWrongSelected) {
                    btnStyles = 'border-rose-200 bg-rose-50 text-rose-800';
                  } else {
                    btnStyles = 'border-gray-100 bg-white opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    disabled={answered}
                    className={`w-full py-3.5 px-4 text-left font-medium text-sm rounded-xl border-2 transition-all flex items-center justify-between group ${btnStyles}`}
                  >
                    <span>{option}</span>
                    {answered && isCorrect && <Check size={18} className="text-emerald-500" />}
                    {answered && isWrongSelected && <X size={18} className="text-rose-500" />}
                  </button>
                );
              })}
            </div>

            {/* Explanations and continue btn */}
            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-2"
                >
                  <p className="text-xs text-gray-600 italic leading-relaxed bg-pink-50/30 p-3.5 rounded-xl border border-pink-100">
                    💡 <span className="font-semibold text-rose-600">Факт любви:</span> {activeQuestion.correctExplanation}
                  </p>

                  <button
                    onClick={handleNext}
                    className="w-full py-3 bg-rose-400 hover:bg-rose-500 text-white text-sm font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>
                      {currentIdx + 1 === questions.length ? 'Посмотреть результаты' : 'Следующий вопрос'}
                    </span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="quiz-finished"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-6"
          >
            <div className="inline-block p-4 bg-rose-100 rounded-full text-rose-500">
              <Trophy size={48} className="animate-bounce" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 font-serif">Кубок Идеальных Половинок! 🎉</h2>
              <p className="text-sm text-gray-500 mt-1">
                Вы ответили правильно на <span className="font-bold text-rose-600">{score} из {questions.length}</span> вопросов!
              </p>
            </div>

            {/* Certificate builder card */}
            <div className="p-6 bg-rose-50/30 rounded-2xl border border-pink-100 text-left space-y-4 max-w-md mx-auto">
              <h3 className="font-bold text-rose-500 text-sm flex items-center gap-1">
                <Award size={16} />
                <span>Генератор Любовного Сертификата 📜</span>
              </h3>
              <p className="text-xs text-gray-600">Чтобы подтвердить ваши безумные 2 года счастья, заполните ваши имена:</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Ее Имя</label>
                  <input
                    type="text"
                    placeholder="Напр. Диана"
                    value={girlName}
                    onChange={(e) => setGirlName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white text-xs border border-pink-100 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Его Имя</label>
                  <input
                    type="text"
                    placeholder="Напр. Марин"
                    value={boyName}
                    onChange={(e) => setBoyName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white text-xs border border-pink-100 rounded-xl"
                  />
                </div>
              </div>

              <button
                onClick={() => setCertificateRevealed(true)}
                disabled={!girlName || !boyName}
                className="w-full py-2.5 bg-gradient-to-r from-rose-400 to-pink-500 disabled:from-gray-200 disabled:to-gray-200 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
              >
                Выпустить официальное свидетельство о гармонии
              </button>
            </div>

            {/* Custom interactive Certificate output */}
            <AnimatePresence>
              {certificateRevealed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="border-8 border-rose-200 bg-white p-6 sm:p-8 rounded-2xl max-w-xl mx-auto shadow-2xl relative overflow-hidden"
                  id="final-love-certificate"
                >
                  {/* Hearts background vector dots */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-r-2 border-b-2 border-rose-100/50 rounded-br-2xl pointer-events-none"></div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-l-2 border-t-2 border-rose-100/50 rounded-tl-2xl pointer-events-none"></div>

                  <span className="text-rose-500 fill-rose-500 text-sm block leading-none select-none mb-3">🌹</span>

                  <h3 className="text-2xl font-bold text-rose-600 font-serif tracking-tight uppercase glow-romantic mb-1">
                    Свидетельство о Счастье
                  </h3>
                  <p className="text-[10px] tracking-widest text-rose-400 uppercase font-mono border-b border-pink-100 pb-3 mb-4">
                    Отношения проверенные 2 годами
                  </p>

                  <p className="text-sm text-gray-500 italic">Настоящим тепло заверяется, что влюбленная пара</p>

                  <div className="my-4 flex items-center justify-center gap-3">
                    <span className="text-lg font-bold text-gray-800 border-b border-rose-400 px-4 py-1 italic font-serif">
                      {girlName}
                    </span>
                    <Heart size={20} className="fill-rose-500 text-rose-500 animate-pulse" />
                    <span className="text-lg font-bold text-gray-800 border-b border-rose-400 px-4 py-1 italic font-serif">
                      {boyName}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
                    прошли сквозь <span className="font-bold text-rose-500">731 день</span> смеха, общих прогулок, сонных утренних какао и нежных полуночных звонков. Они заслуживают звание <span className="font-bold text-rose-500">Самой Прекрасной Пары Вселенной ✨</span> и благословение на бесконечную череду счастливых лет впереди!
                  </p>

                  <div className="mt-8 flex items-center justify-between text-[11px] text-gray-400 font-mono px-4">
                    <div>
                      <p className="italic">Выдано с любовью:</p>
                      <p className="font-bold text-rose-400 mt-0.5">14 июля 2026 г.</p>
                    </div>
                    <div className="text-right">
                      <p className="italic">Печать Амура:</p>
                      <p className="font-bold text-rose-400 mt-0.5">💖 ОДОБРЕНО 💖</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-2xl flex items-center gap-2 text-sm transition-all mx-auto cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Пройти заново</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
