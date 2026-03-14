'use client';
// Game over overlay component
import React, { useEffect, useState } from 'react';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  level: number;
  onRestart: () => void;
  onMenu: () => void;
}

export default function GameOverScreen({ score, highScore, level, onRestart, onMenu }: GameOverScreenProps) {
  const [visible, setVisible] = useState(false);
  const isNewHigh = score >= highScore && score > 0;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center z-30 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(10,5,20,0.88)', backdropFilter: 'blur(4px)' }}
    >
      {/* Broken knife icon */}
      <div className="text-5xl mb-4 select-none animate-bounce">💥</div>

      <h2 className="text-4xl font-black tracking-widest text-red-400 mb-1 drop-shadow-lg">
        GAME OVER
      </h2>
      <p className="text-white/40 text-xs tracking-widest mb-6">Reached Level {level}</p>

      {/* Score */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-center">
          <p className="text-white/40 text-xs tracking-widest">SCORE</p>
          <p className="text-3xl font-black text-white">{score}</p>
        </div>

        {isNewHigh && (
          <div className="px-6 py-2 rounded-full bg-gradient-to-r from-yellow-600/40 to-orange-500/40 border border-yellow-500/50 text-yellow-300 text-xs tracking-widest animate-pulse">
            ✨ NEW HIGH SCORE!
          </div>
        )}

        {!isNewHigh && (
          <p className="text-white/30 text-xs">Best: {highScore}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs px-8">
        <button
          onClick={onRestart}
          className="w-full py-3 rounded-xl font-bold tracking-widest text-sm transition-all duration-200
            bg-gradient-to-r from-cyan-600 to-blue-600 text-white
            hover:from-cyan-500 hover:to-blue-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]
            active:scale-95"
        >
          PLAY AGAIN
        </button>

        <button
          onClick={onMenu}
          className="w-full py-3 rounded-xl font-bold tracking-widest text-sm transition-all duration-200
            bg-white/5 border border-white/20 text-white/70
            hover:bg-white/10 hover:text-white hover:scale-105
            active:scale-95"
        >
          MAIN MENU
        </button>
      </div>
    </div>
  );
}
