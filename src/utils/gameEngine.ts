// Core game engine utilities
import { Apple, GameConfig, Knife, Level, LogState } from '@/types/game';
import { normalizeAngle } from './collision';
import { GAME_CONFIG } from './constants';

let knifeIdCounter = 1000;

/**
 * Generate evenly-spaced preplaced knives on the log, randomized positions
 */
export function generatePreplacedKnives(count: number): Knife[] {
  const knives: Knife[] = [];
  // Distribute evenly with a small random offset
  const step = (2 * Math.PI) / (count + 4); // leave room for player
  const startAngle = Math.random() * Math.PI * 2;
  for (let i = 0; i < count; i++) {
    knives.push({
      id: knifeIdCounter++,
      angle: normalizeAngle(startAngle + i * step),
      isStuck: true,
      flyX: 0,
      flyY: 0,
      velocityY: 0,
    });
  }
  return knives;
}

/**
 * Generate apple positions on log (not overlapping knives)
 */
export function generateApples(count: number, existingKnives: Knife[]): Apple[] {
  const apples: Apple[] = [];
  let attempts = 0;
  for (let i = 0; i < count; i++) {
    let angle = 0;
    let valid = false;
    while (!valid && attempts < 100) {
      angle = Math.random() * 2 * Math.PI;
      valid = true;
      // Check not overlapping with knives
      for (const k of existingKnives) {
        const diff = Math.abs(normalizeAngle(angle) - normalizeAngle(k.angle));
        const minDiff = Math.min(diff, 2 * Math.PI - diff);
        if (minDiff < 0.25) {
          valid = false;
          break;
        }
      }
      // Check not overlapping with other apples
      for (const a of apples) {
        const diff = Math.abs(normalizeAngle(angle) - normalizeAngle(a.angle));
        const minDiff = Math.min(diff, 2 * Math.PI - diff);
        if (minDiff < 0.35) {
          valid = false;
          break;
        }
      }
      attempts++;
    }
    if (valid) {
      apples.push({ id: i, angle, collected: false });
    }
  }
  return apples;
}

/**
 * Create initial log state for a level
 */
export function createLogState(level: Level, config: GameConfig = GAME_CONFIG): LogState {
  return {
    angle: 0,
    angularSpeed: level.angularSpeed,
    direction: Math.random() < 0.5 ? 1 : -1,
    radius: config.logRadius,
    x: config.logCenterX,
    y: config.logCenterY,
  };
}

/**
 * Update log rotation - handles direction changes for harder levels
 */
export function updateLog(
  log: LogState,
  level: Level,
  frameCount: number
): LogState {
  let { angle, direction, angularSpeed } = log;

  // Speed changes: every N frames, possibly change direction or speed
  if (level.speedChanges) {
    const changeInterval = 120; // every 2 seconds at 60fps
    if (frameCount % changeInterval === 0) {
      direction = -direction as 1 | -1;
    }
    // Occasional speed burst
    const burst = Math.sin(frameCount * 0.02) * 0.005;
    angularSpeed = level.angularSpeed + Math.abs(burst);
  }

  angle = normalizeAngle(angle + angularSpeed * direction);

  return { ...log, angle, direction: direction as 1 | -1, angularSpeed };
}

/**
 * Get world-space position of a stuck knife tip
 */
export function getKnifeTipPosition(
  knife: Knife,
  log: LogState,
  config: GameConfig = GAME_CONFIG
): { x: number; y: number } {
  const worldAngle = knife.angle + log.angle;
  const tipDistance = log.radius + config.knifeLength;
  return {
    x: log.x + Math.cos(worldAngle - Math.PI / 2) * tipDistance,
    y: log.y + Math.sin(worldAngle - Math.PI / 2) * tipDistance,
  };
}

/**
 * Get world-space position of knife base (where it meets log)
 */
export function getKnifeBasePosition(
  knife: Knife,
  log: LogState
): { x: number; y: number } {
  const worldAngle = knife.angle + log.angle;
  return {
    x: log.x + Math.cos(worldAngle - Math.PI / 2) * log.radius,
    y: log.y + Math.sin(worldAngle - Math.PI / 2) * log.radius,
  };
}

/**
 * Get the world-space position of an apple on the log
 */
export function getApplePosition(
  apple: Apple,
  log: LogState
): { x: number; y: number } {
  const worldAngle = apple.angle + log.angle;
  return {
    x: log.x + Math.cos(worldAngle - Math.PI / 2) * (log.radius - 8),
    y: log.y + Math.sin(worldAngle - Math.PI / 2) * (log.radius - 8),
  };
}

/**
 * Check if flying knife collected an apple
 */
export function checkAppleCollection(
  knifeX: number,
  knifeY: number,
  apples: Apple[],
  log: LogState
): number | null {
  for (const apple of apples) {
    if (apple.collected) continue;
    const pos = getApplePosition(apple, log);
    const dx = knifeX - pos.x;
    const dy = knifeY - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 20) {
      return apple.id;
    }
  }
  return null;
}
