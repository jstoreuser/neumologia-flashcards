/**
 * Intensive Spaced Repetition Algorithm — pure domain logic.
 *
 * This is a frontend-only computation — no network, no side effects.
 * Designed for short-term "cramming" sessions using minutes/hours.
 *
 * Rating scale:
 *   wrong = 🔴 Errei (1 min)
 *   hard  = 🟡 Difícil (10 min)
 *   good  = 🔵 Correto (1h)
 *   easy  = 🟢 Fácil (4h+)
 */

import type { StudyProgress } from '@shared/contracts';

export type Rating = 'wrong' | 'hard' | 'good' | 'easy';

export interface SM2Result {
  intervalDays: number; // Kept for backwards compatibility in interface
  intervalMinutes: number;
  repetitions: number;
  status: StudyProgress['status'];
  nextReviewDate: Date;
}

/**
 * Calculates the next interval, ease factor, and status given:
 * - current progress record (or null for a brand new card)
 * - the rating the user just gave
 */
export function calculateSm2(
  current: Pick<StudyProgress, 'intervalDays' | 'intervalMinutes' | 'repetitions'> | null,
  rating: Rating,
  now: Date = new Date(),
): SM2Result {
  // Fallback to intervalDays if intervalMinutes isn't set yet from legacy
  const prevInterval = current?.intervalMinutes || (current?.intervalDays ? current.intervalDays * 1440 : 0);
  const prevReps = current?.repetitions ?? 0;

  let newInterval: number;
  let newReps: number;

  if (rating === 'wrong') {
    newReps = 0;
    newInterval = 1; // 🔴 1 minute
  } else if (rating === 'hard') {
    newReps = prevReps + 1;
    if (prevInterval === 0) newInterval = 10;
    else newInterval = Math.min(60, Math.max(10, Math.round(prevInterval * 1.5)));
  } else if (rating === 'good') {
    newReps = prevReps + 1;
    if (prevInterval === 0) newInterval = 60;
    else newInterval = Math.min(240, Math.max(60, Math.round(prevInterval * 2.5)));
  } else if (rating === 'easy') {
    newReps = prevReps + 1;
    if (prevInterval === 0) newInterval = 240;
    else newInterval = Math.max(240, Math.round(prevInterval * 4.0));
  } else {
    newReps = 0;
    newInterval = 1;
  }

  const nextReviewDate = new Date(now.getTime() + newInterval * 60000);

  let status: StudyProgress['status'] = 'learning';
  if (newReps === 0) status = 'new';
  else if (newInterval >= 240) status = 'mastered';
  else if (newInterval >= 60) status = 'review';
  else status = 'learning';

  return {
    intervalDays: Math.floor(newInterval / 1440),
    intervalMinutes: newInterval,
    repetitions: newReps,
    status,
    nextReviewDate,
  };
}

/**
 * Returns true if the card is due for review.
 */
export function isDue(nextReviewDate: Date | null, now: Date = new Date()): boolean {
  if (!nextReviewDate) return true; // New card — always due
  return nextReviewDate <= now;
}

/**
 * Returns a human-readable label for the next interval in minutes/hours.
 */
export function previewInterval(
  current: Pick<StudyProgress, 'intervalDays' | 'intervalMinutes' | 'repetitions'> | null,
  rating: Rating,
): string {
  const result = calculateSm2(current, rating);
  const mins = result.intervalMinutes;
  
  if (mins < 60) return `${mins}m`;
  
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  
  const days = Math.round(hours / 24);
  return `${days}d`;
}
