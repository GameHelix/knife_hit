'use client';
// Level complete overlay component
import React, { useEffect, useState } from 'react';

interface LevelCompleteScreenProps {
  level: number;
  score: number;
  bonus: number;
  isBossLevel: boolean;
  onNext: () => void;
}

export default function LevelCompleteScreen({
  level,
  score,
  bonus,
  isBossLevel,
  onNext,
}: LevelCompleteScreenProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center z-30 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(0,10,30,0.85)', backdropFilter: 'blur(6px)' }}
    >
      {/* Trophy */}
      <div className="text-6xl mb-4 select-none" style={{ animation: 'spin 2s linear infinite' }}>
        {isBossLevel ? '👑' : '🎯'}
      </div>

      <h2 className={`text-3xl font-black tracking-widest mb-1 drop-shadow-lg ${
        isBossLevel
          ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500'
          : 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400'
      }`}>
        {isBossLevel ? 'BOSS DEFEATED!' : 'LEVEL CLEAR!'}
      </h2>

      <p className="text-white/40 text-xs tracking-widest mb-6">Level {level} Complete</p>

      {/* Stats */}
      <div className="flex gap-4 mb-8">
        <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-center">
          <p className="text-white/40 text-xs tracking-widest">SCORE</p>
          <p className="text-2xl font-black text-white">{score}</p>
        </div>
        <div className="px-6 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center">
          <p className="text-cyan-400/70 text-xs tracking-widest">BONUS</p>
          <p className="text-2xl font-black text-cyan-400">+{bonus}</p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="px-12 py-4 rounded-xl font-black tracking-widest text-base transition-all duration-200
          bg-gradient-to-r from-cyan-500 to-purple-600 text-white
          hover:from-cyan-400 hover:to-purple-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]
          active:scale-95"
      >
        NEXT LEVEL →
      </button>
    </div>
  );
}
