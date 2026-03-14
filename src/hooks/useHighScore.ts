'use client';
// Hook for managing high score in localStorage
import { useState } from 'react';

const HIGH_SCORE_KEY = 'knifeHit_highScore';

function readStoredHighScore(): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(HIGH_SCORE_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

export function useHighScore() {
  // Initialize from localStorage directly (runs once on mount, client-side only)
  const [highScore, setHighScore] = useState<number>(readStoredHighScore);

  const updateHighScore = (score: number) => {
    setHighScore(prev => {
      if (score > prev) {
        localStorage.setItem(HIGH_SCORE_KEY, String(score));
        return score;
      }
      return prev;
    });
  };

  return { highScore, updateHighScore };
}
