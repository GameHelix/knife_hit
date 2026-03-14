'use client';
// Main Game component — canvas + UI orchestration
import React, { useCallback, useEffect, useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useSound } from '@/hooks/useSound';
import { useHighScore } from '@/hooks/useHighScore';
import { Difficulty } from '@/types/game';
import { getLevel, SCORE_LEVEL_COMPLETE, GAME_CONFIG } from '@/utils/constants';
import StartScreen from './StartScreen';
import GameOverScreen from './GameOverScreen';
import LevelCompleteScreen from './LevelCompleteScreen';
import HUD from './HUD';

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { highScore, updateHighScore } = useHighScore();
  // Track previous phase to detect transitions (without causing setState cascades)
  const prevPhaseRef = useRef('start');

  const {
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
  } = useGameState();

  const { playSound } = useSound(state.soundEnabled, state.musicEnabled);

  // Sync high score whenever score improves
  useEffect(() => {
    if (state.score > 0) updateHighScore(state.score);
  }, [state.score, updateHighScore]);

  // Level complete fanfare — fire once when phase transitions to levelComplete
  useEffect(() => {
    if (state.phase === 'levelComplete' && prevPhaseRef.current !== 'levelComplete') {
      playSound('levelUp');
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase, playSound]);

  useGameLoop(canvasRef, state, {
    onKnifeStuck: knifeStuck,
    onKnifeCollision: knifeCollision,
    onAppleCollected: appleCollected,
    onUpdateLogAngle: updateLogAngle,
    onUpdateFlyingKnife: updateFlyingKnife,
    onPlaySound: playSound,
  });

  // Throw knife on click / tap
  const handleThrow = useCallback(() => {
    if (state.phase !== 'playing') return;
    if (state.flyingKnife) return;
    throwKnife();
  }, [state.phase, state.flyingKnife, throwKnife]);

  // Keyboard bindings
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        handleThrow();
      }
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (state.phase === 'playing') pause();
        else if (state.phase === 'paused') resume();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleThrow, pause, resume, state.phase]);

  // Scale canvas to viewport while preserving aspect ratio
  const scaleCanvas = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const scaleX = container.clientWidth / GAME_CONFIG.canvasWidth;
    const scaleY = container.clientHeight / GAME_CONFIG.canvasHeight;
    const scale = Math.min(scaleX, scaleY, 1.5);
    canvas.style.width = `${GAME_CONFIG.canvasWidth * scale}px`;
    canvas.style.height = `${GAME_CONFIG.canvasHeight * scale}px`;
  }, []);

  useEffect(() => {
    scaleCanvas();
    window.addEventListener('resize', scaleCanvas);
    return () => window.removeEventListener('resize', scaleCanvas);
  }, [scaleCanvas]);

  const handleStartGame = (difficulty: Difficulty) => {
    startGame(difficulty, highScore);
  };

  const currentLevelData = getLevel(state.currentLevel);
  const levelBonus = SCORE_LEVEL_COMPLETE + state.currentLevel * 20;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-[#050510] overflow-hidden"
    >
      <div className="relative select-none" style={{ lineHeight: 0 }}>
        {/* Canvas — all game rendering happens here */}
        <canvas
          ref={canvasRef}
          width={GAME_CONFIG.canvasWidth}
          height={GAME_CONFIG.canvasHeight}
          onClick={handleThrow}
          onTouchStart={(e) => { e.preventDefault(); handleThrow(); }}
          className="cursor-pointer touch-none block rounded-sm"
        />

        {/* HUD */}
        {(state.phase === 'playing' || state.phase === 'paused') && (
          <HUD
            state={state}
            onPause={pause}
            onResume={resume}
            onToggleSound={toggleSound}
            onToggleMusic={toggleMusic}
          />
        )}

        {/* Start / Main menu screen */}
        {state.phase === 'start' && (
          <StartScreen highScore={highScore} onStart={handleStartGame} />
        )}

        {/* Game over */}
        {state.phase === 'gameOver' && (
          <GameOverScreen
            score={state.score}
            highScore={Math.max(state.highScore, highScore)}
            level={state.currentLevel}
            onRestart={restart}
            onMenu={goToMenu}
          />
        )}

        {/* Level complete */}
        {state.phase === 'levelComplete' && (
          <LevelCompleteScreen
            level={state.currentLevel}
            score={state.score}
            bonus={levelBonus}
            isBossLevel={currentLevelData.bossLevel}
            onNext={nextLevel}
          />
        )}

        {/* Mobile tap hint */}
        {state.phase === 'playing' && !state.flyingKnife && state.knivesRemaining > 0 && (
          <div className="absolute bottom-14 inset-x-0 flex justify-center pointer-events-none">
            <span className="text-white/20 text-[10px] tracking-widest animate-pulse select-none">
              TAP TO THROW
            </span>
          </div>
        )}

        {/* Combo badge */}
        {state.combo >= 3 && state.phase === 'playing' && (
          <div className="absolute top-14 inset-x-0 flex justify-center pointer-events-none">
            <div className="px-4 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 animate-pulse">
              <span className="text-yellow-300 text-xs font-bold tracking-widest">
                {state.combo}× COMBO!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
