'use client';
// Game loop hook - drives animation frame, physics, and rendering
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { GameState, FlyingKnife } from '@/types/game';
import { GAME_CONFIG, getLevel, DIFFICULTY_CONFIG } from '@/utils/constants';
import { checkKnifeCollision, hasReachedLog, normalizeAngle } from '@/utils/collision';
import { getApplePosition, updateLog } from '@/utils/gameEngine';

interface GameLoopCallbacks {
  onKnifeStuck: (knifeId: number, angle: number) => void;
  onKnifeCollision: () => void;
  onAppleCollected: (appleId: number) => void;
  onUpdateLogAngle: (angle: number, direction: 1 | -1, speed: number) => void;
  onUpdateFlyingKnife: (knife: FlyingKnife | null) => void;
  onPlaySound: (type: 'throw' | 'stick' | 'apple' | 'collision' | 'levelUp') => void;
}

export function useGameLoop(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  gameState: GameState,
  callbacks: GameLoopCallbacks
) {
  const frameCountRef = useRef(0);
  const rafRef = useRef<number>(0);
  const stateRef = useRef(gameState);
  const cbRef = useRef(callbacks);
  const knifeIdRef = useRef(10000);
  // Guard: prevent double-processing the same flying knife event
  const resolvedKnifeIdRef = useRef<number | null>(null);
  // Self-referencing loop stored in a ref to avoid forward-declaration lint error
  const gameLoopRef = useRef<() => void>(() => { /* placeholder */ });

  // Sync refs with latest values after every render (useLayoutEffect runs synchronously before paint)
  useLayoutEffect(() => {
    stateRef.current = gameState;
    cbRef.current = callbacks;
  });

  const drawFrame = useCallback((overrideLogAngle?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = stateRef.current;
    const config = GAME_CONFIG;
    const { stuckKnives, flyingKnife, apples, phase } = state;
    // Use override log angle when provided (computed this frame, not yet in React state)
    const log = overrideLogAngle !== undefined
      ? { ...state.log, angle: overrideLogAngle }
      : state.log;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#0a0a1a');
    bgGrad.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStarfield(ctx);

    drawLog(ctx, log, state.currentLevel);

    for (const apple of apples) {
      if (!apple.collected) {
        const pos = getApplePosition(apple, log);
        drawApple(ctx, pos.x, pos.y);
      }
    }

    for (const knife of stuckKnives) {
      const worldAngle = knife.angle + log.angle;
      const baseX = log.x + Math.cos(worldAngle - Math.PI / 2) * log.radius;
      const baseY = log.y + Math.sin(worldAngle - Math.PI / 2) * log.radius;
      const tipX = log.x + Math.cos(worldAngle - Math.PI / 2) * (log.radius + config.knifeLength);
      const tipY = log.y + Math.sin(worldAngle - Math.PI / 2) * (log.radius + config.knifeLength);
      drawKnife(ctx, baseX, baseY, tipX, tipY);
    }

    if (flyingKnife) {
      const tipX = flyingKnife.x;
      const tipY = flyingKnife.y - config.knifeLength;
      drawKnife(ctx, flyingKnife.x, flyingKnife.y, tipX, tipY);
    }

    // Idle knife at bottom waiting to be thrown
    if (!flyingKnife && (phase === 'playing' || phase === 'paused') && state.knivesRemaining > 0) {
      const waitX = config.logCenterX;
      const waitY = config.knifeStartY;
      drawKnife(ctx, waitX, waitY, waitX, waitY - config.knifeLength);
    }

    drawKnifeQueue(ctx, state.knivesRemaining, canvas.width, canvas.height);

    if (phase === 'paused') {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Orbitron, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
  }, [canvasRef]);

  const gameLoop = useCallback(() => {
    const state = stateRef.current;
    const cb = cbRef.current;
    frameCountRef.current++;
    const frame = frameCountRef.current;

    if (state.phase !== 'playing') {
      drawFrame();
      rafRef.current = requestAnimationFrame(gameLoopRef.current);
      return;
    }

    // --- Update log rotation ---
    const level = getLevel(state.currentLevel);
    const diffConfig = DIFFICULTY_CONFIG[state.difficulty];
    const adjustedLevel = {
      ...level,
      angularSpeed: level.angularSpeed * diffConfig.speedMultiplier,
    };
    const newLog = updateLog(state.log, adjustedLevel, frame);
    cb.onUpdateLogAngle(newLog.angle, newLog.direction as 1 | -1, newLog.angularSpeed);

    // --- Update flying knife physics ---
    if (state.flyingKnife && state.flyingKnife.id !== resolvedKnifeIdRef.current) {
      const knife = state.flyingKnife;
      const newY = knife.y + knife.velocityY;
      const newKnifeState: FlyingKnife = { ...knife, y: newY };

      // Check apple collection
      const liveLog = { ...state.log, angle: newLog.angle };
      for (const apple of state.apples) {
        if (apple.collected) continue;
        const pos = getApplePosition(apple, liveLog);
        const dx = knife.x - pos.x;
        const dy = newY - pos.y;
        if (Math.sqrt(dx * dx + dy * dy) < 22) {
          cb.onAppleCollected(apple.id);
          cb.onPlaySound('apple');
        }
      }

      // Check if knife tip has reached the log surface
      if (hasReachedLog(newY, GAME_CONFIG.logCenterY, GAME_CONFIG.logRadius, GAME_CONFIG.knifeLength)) {
        // Mark as resolved so we don't re-process on the next frame before React re-renders
        resolvedKnifeIdRef.current = knife.id;

        // Compute impact angle in log-local space
        // Knife travels straight up along x=logCenterX → hits at world angle = -π/2 (top = "12 o'clock")
        // But our log draws 0° at the right, so -π/2 is the top. The knife hits from below at angle = π/2.
        const worldImpactAngle = Math.PI / 2; // "6 o'clock" (bottom of the log in world space)
        const localAngle = normalizeAngle(worldImpactAngle - newLog.angle);

        const collides = checkKnifeCollision(state.stuckKnives, localAngle);
        if (collides) {
          cb.onPlaySound('collision');
          cb.onKnifeCollision();
        } else {
          cb.onPlaySound('stick');
          cb.onKnifeStuck(knifeIdRef.current++, localAngle);
        }
      } else {
        cb.onUpdateFlyingKnife(newKnifeState);
      }
    }

    // Reset resolved guard when there's no flying knife (state caught up)
    if (!state.flyingKnife) {
      resolvedKnifeIdRef.current = null;
    }

    drawFrame(newLog.angle);
    rafRef.current = requestAnimationFrame(gameLoopRef.current);
  }, [drawFrame]);

  // Keep gameLoopRef in sync so the rAF call always invokes the latest version
  useLayoutEffect(() => {
    gameLoopRef.current = gameLoop;
  }, [gameLoop]);

  useEffect(() => {
    if (gameState.phase === 'start') {
      drawFrame();
      return;
    }
    rafRef.current = requestAnimationFrame(gameLoopRef.current);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [gameState.phase, gameLoop, drawFrame]);

  useEffect(() => {
    if (gameState.phase !== 'playing') {
      drawFrame();
    }
  }, [gameState.phase, drawFrame]);
}

// ─── Drawing Helpers ──────────────────────────────────────────────────────────

const STARS: Array<{ x: number; y: number; r: number; alpha: number }> = Array.from(
  { length: 70 },
  () => ({
    x: Math.random() * 480,
    y: Math.random() * 700,
    r: Math.random() * 1.5 + 0.3,
    alpha: Math.random() * 0.6 + 0.2,
  })
);

function drawStarfield(ctx: CanvasRenderingContext2D) {
  for (const s of STARS) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,200,255,${s.alpha})`;
    ctx.fill();
  }
}

function drawLog(ctx: CanvasRenderingContext2D, log: GameState['log'], level: number) {
  const { x, y, radius, angle } = log;

  // Outer glow
  const outerGlow = ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius * 1.5);
  outerGlow.addColorStop(0, 'rgba(180,120,60,0.08)');
  outerGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Log body
  const grad = ctx.createRadialGradient(-radius * 0.25, -radius * 0.25, 2, 0, 0, radius);
  grad.addColorStop(0, '#9B7350');
  grad.addColorStop(0.35, '#7B5535');
  grad.addColorStop(0.75, '#5A3E22');
  grad.addColorStop(1, '#3D2A15');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // Tree rings
  for (const [ratio, alpha] of [[0.72, 0.18], [0.52, 0.13], [0.32, 0.1]] as [number, number][]) {
    ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius * ratio, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Boss ring
  if (level % 4 === 0) {
    ctx.shadowColor = '#ff3030';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = 'rgba(255,50,50,0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  ctx.restore();

  // Surface outline
  ctx.strokeStyle = 'rgba(210,160,90,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawKnife(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  baseY: number,
  tipX: number,
  tipY: number
) {
  const dx = tipX - baseX;
  const dy = tipY - baseY;
  const len = Math.sqrt(dx * dx + dy * dy) || 60;
  const angle = Math.atan2(dy, dx);

  ctx.save();
  ctx.translate(baseX, baseY);
  ctx.rotate(angle + Math.PI / 2); // rotate so blade points "up" in local space

  // Handle
  const handleGrad = ctx.createLinearGradient(-5, 0, 5, 0);
  handleGrad.addColorStop(0, '#1e1e2e');
  handleGrad.addColorStop(0.5, '#3a3a5a');
  handleGrad.addColorStop(1, '#1e1e2e');
  ctx.fillStyle = handleGrad;
  ctx.beginPath();
  ctx.roundRect(-5, -len * 0.38, 10, len * 0.38, [3, 3, 2, 2]);
  ctx.fill();

  // Handle grip lines
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    const gY = -len * 0.38 + (len * 0.38 / 4) * i;
    ctx.beginPath();
    ctx.moveTo(-4, gY);
    ctx.lineTo(4, gY);
    ctx.stroke();
  }

  // Guard
  ctx.fillStyle = '#6a6a7a';
  ctx.fillRect(-7, -len * 0.4, 14, 3);

  // Blade
  const bladeGrad = ctx.createLinearGradient(-4, -len, 4, -len * 0.4);
  bladeGrad.addColorStop(0, '#d8d8e8');
  bladeGrad.addColorStop(0.25, '#f0f0ff');
  bladeGrad.addColorStop(0.7, '#b0b0c0');
  bladeGrad.addColorStop(1, '#808090');
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(-4, -len * 0.4);
  ctx.lineTo(4, -len * 0.4);
  ctx.lineTo(1.5, -len);
  ctx.lineTo(-1.5, -len);
  ctx.closePath();
  ctx.fill();

  // Blade shine
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-2, -len * 0.42);
  ctx.lineTo(-1, -len * 0.96);
  ctx.stroke();

  // Neon tip glow
  ctx.shadowColor = '#80d4ff';
  ctx.shadowBlur = 7;
  ctx.strokeStyle = 'rgba(120,210,255,0.35)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -len * 0.6);
  ctx.lineTo(0, -len);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.restore();
}

function drawApple(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = '#ff3333';
  ctx.shadowBlur = 14;

  // Apple body
  ctx.fillStyle = '#e02828';
  ctx.beginPath();
  ctx.arc(0, 2, 9, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.beginPath();
  ctx.ellipse(-3, -1, 3.5, 2.2, -0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Stem
  ctx.strokeStyle = '#2e1a0a';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.quadraticCurveTo(4, -12, 7, -10);
  ctx.stroke();

  // Leaf
  ctx.fillStyle = '#2a8a20';
  ctx.beginPath();
  ctx.ellipse(4, -11, 4, 2, -0.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawKnifeQueue(
  ctx: CanvasRenderingContext2D,
  remaining: number,
  canvasW: number,
  canvasH: number
) {
  if (remaining <= 0) return;
  const dotR = 5;
  const spacing = 16;
  const total = remaining;
  const startX = canvasW / 2 - ((total - 1) * spacing) / 2;
  const dotY = canvasH - 28;

  for (let i = 0; i < total; i++) {
    const cx = startX + i * spacing;
    ctx.shadowColor = '#7fd4ff';
    ctx.shadowBlur = 7;
    ctx.fillStyle = '#7fd4ff';
    ctx.beginPath();
    ctx.arc(cx, dotY, dotR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}
