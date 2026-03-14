'use client';
// Main game state management hook
import { useCallback, useReducer } from 'react';
import { Difficulty, FlyingKnife, GameState, Knife } from '@/types/game';
import {
  generateApples,
  generatePreplacedKnives,
  createLogState,
} from '@/utils/gameEngine';
import { getLevel, DIFFICULTY_CONFIG, GAME_CONFIG, SCORE_APPLE, SCORE_KNIFE, SCORE_LEVEL_COMPLETE } from '@/utils/constants';
// collision utilities used by gameEngine

type GameAction =
  | { type: 'START_GAME'; difficulty: Difficulty; highScore: number }
  | { type: 'THROW_KNIFE' }
  | { type: 'KNIFE_STUCK'; knifeId: number; angle: number }
  | { type: 'KNIFE_COLLISION' }
  | { type: 'APPLE_COLLECTED'; appleId: number }
  | { type: 'LEVEL_COMPLETE' }
  | { type: 'NEXT_LEVEL' }
  | { type: 'GAME_OVER' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESTART' }
  | { type: 'GO_TO_MENU' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TOGGLE_MUSIC' }
  | { type: 'UPDATE_LOG_ANGLE'; angle: number; direction: 1 | -1; speed: number }
  | { type: 'UPDATE_FLYING_KNIFE'; knife: FlyingKnife | null }
  | { type: 'SET_LAST_THROW_RESULT'; result: GameState['lastThrowResult'] };

let knifeCounter = 0;

function buildInitialLevelState(
  levelNumber: number,
  difficulty: Difficulty,
  existingState?: Partial<GameState>
): Partial<GameState> {
  const level = getLevel(levelNumber);
  const config = DIFFICULTY_CONFIG[difficulty];

  // Adjust level params by difficulty
  const adjustedLevel = {
    ...level,
    angularSpeed: level.angularSpeed * config.speedMultiplier,
    preplacedKnives: Math.round(level.preplacedKnives * config.preplacedMultiplier),
  };

  const stuckKnives = generatePreplacedKnives(adjustedLevel.preplacedKnives);
  const apples = generateApples(level.apples, stuckKnives);
  const log = createLogState(adjustedLevel);

  return {
    phase: 'playing',
    currentLevel: levelNumber,
    knivesRemaining: level.knivesToThrow,
    stuckKnives,
    flyingKnife: null,
    log,
    apples,
    combo: 0,
    lastThrowResult: null,
    ...existingState,
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const levelState = buildInitialLevelState(1, action.difficulty);
      return {
        ...state,
        ...levelState,
        phase: 'playing',
        score: 0,
        highScore: action.highScore,
        difficulty: action.difficulty,
      } as GameState;
    }

    case 'THROW_KNIFE': {
      if (state.flyingKnife || state.knivesRemaining <= 0 || state.phase !== 'playing') {
        return state;
      }
      const id = ++knifeCounter;
      return {
        ...state,
        flyingKnife: {
          id,
          x: GAME_CONFIG.logCenterX,
          y: GAME_CONFIG.knifeStartY,
          velocityY: -GAME_CONFIG.knifeSpeed,
        },
        lastThrowResult: null,
      };
    }

    case 'KNIFE_STUCK': {
      if (!state.flyingKnife) return state;
      const newKnife: Knife = {
        id: action.knifeId,
        angle: action.angle,
        isStuck: true,
        flyX: 0,
        flyY: 0,
        velocityY: 0,
      };

      const newKnivesRemaining = state.knivesRemaining - 1;
      const newScore = state.score + SCORE_KNIFE * (1 + Math.floor(state.combo / 3));

      // Check if level is complete
      if (newKnivesRemaining <= 0) {
        return {
          ...state,
          flyingKnife: null,
          stuckKnives: [...state.stuckKnives, newKnife],
          knivesRemaining: 0,
          score: newScore,
          combo: state.combo + 1,
          lastThrowResult: 'hit',
          phase: 'levelComplete',
        };
      }

      return {
        ...state,
        flyingKnife: null,
        stuckKnives: [...state.stuckKnives, newKnife],
        knivesRemaining: newKnivesRemaining,
        score: newScore,
        combo: state.combo + 1,
        lastThrowResult: 'hit',
      };
    }

    case 'APPLE_COLLECTED': {
      const newApples = state.apples.map(a =>
        a.id === action.appleId ? { ...a, collected: true } : a
      );
      return {
        ...state,
        apples: newApples,
        score: state.score + SCORE_APPLE,
        lastThrowResult: 'apple',
      };
    }

    case 'KNIFE_COLLISION': {
      return {
        ...state,
        phase: 'gameOver',
        flyingKnife: null,
        lastThrowResult: 'miss',
        combo: 0,
      };
    }

    case 'LEVEL_COMPLETE': {
      return { ...state, phase: 'levelComplete' };
    }

    case 'NEXT_LEVEL': {
      const nextLevel = state.currentLevel + 1;
      const levelBonus = SCORE_LEVEL_COMPLETE + state.currentLevel * 20;
      const levelState = buildInitialLevelState(nextLevel, state.difficulty);
      return {
        ...state,
        ...levelState,
        score: state.score + levelBonus,
        highScore: Math.max(state.highScore, state.score + levelBonus),
      } as GameState;
    }

    case 'GAME_OVER': {
      return {
        ...state,
        phase: 'gameOver',
        flyingKnife: null,
        highScore: Math.max(state.highScore, state.score),
      };
    }

    case 'PAUSE': {
      return { ...state, phase: 'paused' };
    }

    case 'RESUME': {
      return { ...state, phase: 'playing' };
    }

    case 'RESTART': {
      const levelState = buildInitialLevelState(1, state.difficulty);
      return {
        ...state,
        ...levelState,
        score: 0,
        phase: 'playing',
      } as GameState;
    }

    case 'GO_TO_MENU': {
      return { ...state, phase: 'start', flyingKnife: null };
    }

    case 'TOGGLE_SOUND': {
      return { ...state, soundEnabled: !state.soundEnabled };
    }

    case 'TOGGLE_MUSIC': {
      return { ...state, musicEnabled: !state.musicEnabled };
    }

    case 'UPDATE_LOG_ANGLE': {
      return {
        ...state,
        log: {
          ...state.log,
          angle: action.angle,
          direction: action.direction,
          angularSpeed: action.speed,
        },
      };
    }

    case 'UPDATE_FLYING_KNIFE': {
      return { ...state, flyingKnife: action.knife };
    }

    case 'SET_LAST_THROW_RESULT': {
      return { ...state, lastThrowResult: action.result };
    }

    default:
      return state;
  }
}

const initialState: GameState = {
  phase: 'start',
  score: 0,
  highScore: 0,
  currentLevel: 1,
  knivesRemaining: 5,
  stuckKnives: [],
  flyingKnife: null,
  log: {
    angle: 0,
    angularSpeed: 0.018,
    direction: 1,
    radius: GAME_CONFIG.logRadius,
    x: GAME_CONFIG.logCenterX,
    y: GAME_CONFIG.logCenterY,
  },
  apples: [],
  difficulty: 'medium',
  soundEnabled: true,
  musicEnabled: false,
  combo: 0,
  lastThrowResult: null,
};

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startGame = useCallback((difficulty: Difficulty, highScore: number) => {
    dispatch({ type: 'START_GAME', difficulty, highScore });
  }, []);

  const throwKnife = useCallback(() => {
    dispatch({ type: 'THROW_KNIFE' });
  }, []);

  const knifeStuck = useCallback((knifeId: number, angle: number) => {
    dispatch({ type: 'KNIFE_STUCK', knifeId, angle });
  }, []);

  const knifeCollision = useCallback(() => {
    dispatch({ type: 'KNIFE_COLLISION' });
  }, []);

  const appleCollected = useCallback((appleId: number) => {
    dispatch({ type: 'APPLE_COLLECTED', appleId });
  }, []);

  const nextLevel = useCallback(() => {
    dispatch({ type: 'NEXT_LEVEL' });
  }, []);

  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resume = useCallback(() => dispatch({ type: 'RESUME' }), []);
  const restart = useCallback(() => dispatch({ type: 'RESTART' }), []);
  const goToMenu = useCallback(() => dispatch({ type: 'GO_TO_MENU' }), []);
  const toggleSound = useCallback(() => dispatch({ type: 'TOGGLE_SOUND' }), []);
  const toggleMusic = useCallback(() => dispatch({ type: 'TOGGLE_MUSIC' }), []);

  const updateLogAngle = useCallback((angle: number, direction: 1 | -1, speed: number) => {
    dispatch({ type: 'UPDATE_LOG_ANGLE', angle, direction, speed });
  }, []);

  const updateFlyingKnife = useCallback((knife: FlyingKnife | null) => {
    dispatch({ type: 'UPDATE_FLYING_KNIFE', knife });
  }, []);

  return {
    state,
    startGame,
    throwKnife,
    knifeStuck,
    knifeCollision,
    appleCollected,
    nextLevel,
    pause,
    resume,
    restart,
    goToMenu,
    toggleSound,
    toggleMusic,
    updateLogAngle,
    updateFlyingKnife,
  };
}
