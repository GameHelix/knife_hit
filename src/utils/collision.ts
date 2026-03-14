// Collision detection utilities
import { Knife } from '@/types/game';
import { MIN_KNIFE_GAP } from './constants';

/**
 * Normalize an angle to [0, 2π)
 */
export function normalizeAngle(angle: number): number {
  let a = angle % (2 * Math.PI);
  if (a < 0) a += 2 * Math.PI;
  return a;
}

/**
 * Get the minimum angular distance between two angles (handles wrap-around)
 */
export function angularDistance(a: number, b: number): number {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(diff, 2 * Math.PI - diff);
}

/**
 * Check if a newly landed knife (at `newAngle`) collides with any existing stuck knives.
 * Returns true if there's a collision.
 */
export function checkKnifeCollision(stuckKnives: Knife[], newAngle: number): boolean {
  for (const knife of stuckKnives) {
    if (angularDistance(knife.angle, newAngle) < MIN_KNIFE_GAP) {
      return true;
    }
  }
  return false;
}

/**
 * Get the angle of a point on the log rim closest to a flying knife's position.
 * The flying knife travels along x=logCenterX, from below, so we can compute
 * the angle where the knife would embed.
 */
export function getImpactAngle(
  logX: number,
  logY: number,
  logAngle: number // current rotation of log
): number {
  // The knife always hits the bottom of the log (angle = π/2 from top, i.e., straight down)
  // We compute the angle in log-local space (subtract log's current rotation)
  // In world space, the knife hits at angle = Math.PI / 2 (6 o'clock position)
  const worldAngle = Math.PI / 2;
  // Convert to log-local angle
  const localAngle = normalizeAngle(worldAngle - logAngle);
  return localAngle;
}

/**
 * Check if a flying knife's tip has reached the log radius threshold
 */
export function hasReachedLog(
  knifeY: number,
  logCenterY: number,
  logRadius: number,
  knifeLength: number
): boolean {
  // Knife tip (top of knife going up) reaches log edge
  return knifeY - knifeLength <= logCenterY + logRadius;
}
