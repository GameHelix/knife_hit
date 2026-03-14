'use client';
// Start screen component
import React from 'react';
import { Difficulty } from '@/types/game';

interface StartScreenProps {
  highScore: number;
  onStart: (difficulty: Difficulty) => void;
}

export default function StartScreen({ highScore, onStart }: StartScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-gradient-to-b from-[#0a0a1a] to-[#1a0a2e]">
      {/* Title */}
      <div className="mb-2 text-center">
        <h1 className="text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 drop-shadow-lg select-none">
          KNIFE
        </h1>
        <h1 className="text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-400 to-cyan-400 drop-shadow-lg select-none">
          HIT
        </h1>
      </div>

      {/* Knife icon */}
      <div className="my-6 text-6xl select-none" style={{ filter: 'drop-shadow(0 0 12px #7fd4ff)' }}>
        🗡️
      </div>

      {/* High score */}
      {highScore > 0 && (
        <div className="mb-6 px-6 py-2 rounded-full bg-white/5 border border-cyan-500/30 text-cyan-300 text-sm tracking-widest">
          BEST: {highScore}
        </div>
      )}

      {/* Instructions */}
      <p className="text-white/50 text-xs mb-8 text-center px-8 leading-relaxed">
        Throw knives at the spinning log.<br />
        Don&apos;t hit other knives!
      </p>

      {/* Difficulty buttons */}
      <div className="flex flex-col items-center gap-3 w-full max-w-xs px-8">
        <p className="text-white/40 text-xs tracking-widest mb-1">SELECT DIFFICULTY</p>

        <button
          onClick={() => onStart('easy')}
          className="w-full py-3 rounded-xl font-bold tracking-widest text-sm transition-all duration-200
            bg-gradient-to-r from-green-600/80 to-emerald-500/80 text-white
            hover:from-green-500 hover:to-emerald-400 hover:scale-105 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]
            active:scale-95"
        >
          EASY
        </button>

        <button
          onClick={() => onStart('medium')}
          className="w-full py-3 rounded-xl font-bold tracking-widest text-sm transition-all duration-200
            bg-gradient-to-r from-cyan-600/80 to-blue-500/80 text-white
            hover:from-cyan-500 hover:to-blue-400 hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]
            active:scale-95"
        >
          MEDIUM
        </button>

        <button
          onClick={() => onStart('hard')}
          className="w-full py-3 rounded-xl font-bold tracking-widest text-sm transition-all duration-200
            bg-gradient-to-r from-red-600/80 to-pink-500/80 text-white
            hover:from-red-500 hover:to-pink-400 hover:scale-105 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]
            active:scale-95"
        >
          HARD
        </button>
      </div>

      {/* Controls hint */}
      <div className="mt-8 text-white/30 text-xs text-center">
        <p>Space / Click / Tap to throw</p>
      </div>
    </div>
  );
}
