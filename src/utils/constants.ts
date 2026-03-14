// Game constants and level definitions
import { Level, GameConfig, Difficulty } from '@/types/game';

export const GAME_CONFIG: GameConfig = {
  canvasWidth: 480,
  canvasHeight: 700,
  logCenterX: 240,
  logCenterY: 280,
  logRadius: 90,
  knifeLength: 60,
  knifeStartY: 580,
  knifeSpeed: 12,
  knifeCollisionRadius: 8,
};

// Minimum angular gap (radians) between knives to avoid collision
export const MIN_KNIFE_GAP = 0.22;

// Score values
export const SCORE_KNIFE = 10;
export const SCORE_APPLE = 50;
export const SCORE_LEVEL_COMPLETE = 100;

// Levels definition
export const LEVELS: Level[] = [
  // Level 1 - Tutorial
  {
    levelNumber: 1,
    knivesToThrow: 5,
    preplacedKnives: 2,
    angularSpeed: 0.018,
    speedChanges: false,
    bossLevel: false,
    apples: 1,
  },
  // Level 2
  {
    levelNumber: 2,
    knivesToThrow: 6,
    preplacedKnives: 2,
    angularSpeed: 0.022,
    speedChanges: false,
    bossLevel: false,
    apples: 1,
  },
  // Level 3
  {
    levelNumber: 3,
    knivesToThrow: 7,
    preplacedKnives: 3,
    angularSpeed: 0.025,
    speedChanges: true,
    bossLevel: false,
    apples: 2,
  },
  // Level 4 - Boss
  {
    levelNumber: 4,
    knivesToThrow: 8,
    preplacedKnives: 4,
    angularSpeed: 0.030,
    speedChanges: true,
    bossLevel: true,
    apples: 1,
  },
  // Level 5
  {
    levelNumber: 5,
    knivesToThrow: 7,
    preplacedKnives: 3,
    angularSpeed: 0.028,
    speedChanges: true,
    bossLevel: false,
    apples: 2,
  },
  // Level 6
  {
    levelNumber: 6,
    knivesToThrow: 9,
    preplacedKnives: 4,
    angularSpeed: 0.033,
    speedChanges: true,
    bossLevel: false,
    apples: 1,
  },
  // Level 7
  {
    levelNumber: 7,
    knivesToThrow: 8,
    preplacedKnives: 5,
    angularSpeed: 0.036,
    speedChanges: true,
    bossLevel: false,
    apples: 2,
  },
  // Level 8 - Boss
  {
    levelNumber: 8,
    knivesToThrow: 10,
    preplacedKnives: 5,
    angularSpeed: 0.040,
    speedChanges: true,
    bossLevel: true,
    apples: 1,
  },
  // Level 9
  {
    levelNumber: 9,
    knivesToThrow: 9,
    preplacedKnives: 6,
    angularSpeed: 0.038,
    speedChanges: true,
    bossLevel: false,
    apples: 2,
  },
  // Level 10 - Final Boss
  {
    levelNumber: 10,
    knivesToThrow: 12,
    preplacedKnives: 6,
    angularSpeed: 0.045,
    speedChanges: true,
    bossLevel: true,
    apples: 2,
  },
];

// Difficulty multipliers
export const DIFFICULTY_CONFIG: Record<Difficulty, { speedMultiplier: number; preplacedMultiplier: number }> = {
  easy: { speedMultiplier: 0.7, preplacedMultiplier: 0.7 },
  medium: { speedMultiplier: 1.0, preplacedMultiplier: 1.0 },
  hard: { speedMultiplier: 1.4, preplacedMultiplier: 1.3 },
};

// Get level (loops through levels with increasing difficulty after max)
export function getLevel(levelNumber: number): Level {
  const idx = (levelNumber - 1) % LEVELS.length;
  const base = LEVELS[idx];
  const extraCycles = Math.floor((levelNumber - 1) / LEVELS.length);
  return {
    ...base,
    levelNumber,
    angularSpeed: base.angularSpeed + extraCycles * 0.008,
    preplacedKnives: Math.min(base.preplacedKnives + extraCycles, 10),
    knivesToThrow: base.knivesToThrow + extraCycles,
  };
}
