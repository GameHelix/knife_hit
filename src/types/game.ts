// Core game types for Knife Hit

export type GamePhase = 'start' | 'playing' | 'paused' | 'levelComplete' | 'gameOver';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Position {
  x: number;
  y: number;
}

export interface Knife {
  id: number;
  angle: number;          // angle in radians where knife is stuck on log
  isStuck: boolean;       // true = embedded in log, false = flying
  flyY: number;           // current Y position while flying (only used when !isStuck)
  flyX: number;           // current X position while flying
  velocityY: number;      // velocity while flying
}

export interface FlyingKnife {
  id: number;
  x: number;
  y: number;
  velocityY: number;
}

export interface LogState {
  angle: number;          // current rotation angle of the log (radians)
  angularSpeed: number;   // radians per frame
  direction: number;      // 1 or -1
  radius: number;         // radius of the log
  x: number;
  y: number;
}

export interface Level {
  levelNumber: number;
  knivesToThrow: number;    // total knives player must throw
  preplacedKnives: number;  // knives already on the log at start
  angularSpeed: number;     // log rotation speed (rad/frame)
  speedChanges: boolean;    // does the log change speed/direction mid-level
  bossLevel: boolean;
  apples: number;           // apple count on log (bonus pickups)
}

export interface Apple {
  id: number;
  angle: number;            // angle on log where apple is placed
  collected: boolean;
}

export interface GameState {
  phase: GamePhase;
  score: number;
  highScore: number;
  currentLevel: number;
  knivesRemaining: number;
  stuckKnives: Knife[];
  flyingKnife: FlyingKnife | null;
  log: LogState;
  apples: Apple[];
  difficulty: Difficulty;
  soundEnabled: boolean;
  musicEnabled: boolean;
  combo: number;
  lastThrowResult: 'hit' | 'miss' | 'apple' | null;
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  logCenterX: number;
  logCenterY: number;
  logRadius: number;
  knifeLength: number;
  knifeStartY: number;
  knifeSpeed: number;
  knifeCollisionRadius: number;
}
