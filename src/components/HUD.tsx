'use client';
// Heads-up display: score, level, controls
import React from 'react';
import { GameState } from '@/types/game';

interface HUDProps {
  state: GameState;
  onPause: () => void;
  onResume: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export default function HUD({ state, onPause, onResume, onToggleSound, onToggleMusic }: HUDProps) {
  const { score, highScore, currentLevel, phase, soundEnabled, musicEnabled } = state;

  return (
    <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between px-4 pt-3 pointer-events-none">
      {/* Left: Score */}
      <div className="flex flex-col">
        <span className="text-white/40 text-[10px] tracking-widest">SCORE</span>
        <span className="text-white font-black text-xl leading-none tabular-nums">{score}</span>
        {highScore > 0 && (
          <span className="text-white/30 text-[10px] tabular-nums">BEST {highScore}</span>
        )}
      </div>

      {/* Center: Level badge */}
      <div className="flex flex-col items-center pointer-events-auto">
        <div className="px-4 py-1 rounded-full bg-gradient-to-r from-cyan-600/40 to-purple-600/40 border border-cyan-500/30">
          <span className="text-cyan-300 font-bold text-xs tracking-widest">LEVEL {currentLevel}</span>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex gap-2 pointer-events-auto">
        {/* Sound toggle */}
        <button
          onClick={onToggleSound}
          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center
            text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
          title={soundEnabled ? 'Mute SFX' : 'Unmute SFX'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        {/* Music toggle */}
        <button
          onClick={onToggleMusic}
          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center
            text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
          title={musicEnabled ? 'Stop Music' : 'Play Music'}
        >
          {musicEnabled ? '🎵' : '🎶'}
        </button>

        {/* Pause/Resume */}
        {(phase === 'playing' || phase === 'paused') && (
          <button
            onClick={phase === 'playing' ? onPause : onResume}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center
              text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
            title={phase === 'playing' ? 'Pause' : 'Resume'}
          >
            {phase === 'playing' ? '⏸' : '▶️'}
          </button>
        )}
      </div>
    </div>
  );
}
