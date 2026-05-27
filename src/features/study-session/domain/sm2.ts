/**
 * SM-2 Spaced Repetition Algorithm — pure domain logic.
 *
 * This is a frontend-only computation — no network, no side effects.
 * The result is persisted to Firestore by the session service.
 *
 * Rating scale (matches Anki):
 *   wrong  = 0  — complete blackout
 *   hard   = 2  — significant difficulty
 *   good   = 3  — correct with effort
 *   easy   = 4  — perfect recall
 *
 * Reference: Wozniak, P.A. (1990). Optimization of learning.
 */

import type { StudyProgress } from '@shared/contracts';

export type Rating = 'wrong' | 'hard' | 'good' | 'easy';

// Map rating labels to SM-2 quality scores (0–5)
const QUALITY: Record<Rating, number> = {
  wrong: 0,
  hard: 2,
  good: 3,
  easy: 4,
};

const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

export interface SM2Result {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  status: StudyProgress['status'];
  nextReviewDate: Date;
}

/**
 * Calculates the next interval, ease factor, and status given:
 * - current progress record (or null for a brand new card)
 * - the rating the user just gave
 *
 * Returns an immutable result object — no side effects.
 */
export function calculateSm2(
  current: Pick<StudyProgress, 'easeFactor' | 'intervalDays' | 'repetitions'> | null,
  rating: Rating,
  now: Date = new Date(),
): SM2Result {
  const quality = QUALITY[rating];

  const prevEase = current?.easeFactor ?? DEFAULT_EASE;
  const prevInterval = current?.intervalDays ?? 0;
  const prevReps = current?.repetitions ?? 0;

  let newEase: number;
  let newInterval: number;
  let newReps: number;

  if (quality < 3) {
    // Failed recall: reset interval, keep ease (slightly penalized below)
    newReps = 0;
    newInterval = 1;
    // SM-2 ease penalty for failed recall
    newEase = Math.max(MIN_EASE, prevEase - 0.2);
  } else {
    // Successful recall
    newReps = prevReps + 1;

    if (newReps === 1) {
      newInterval = 1;
    } else if (newReps === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(prevInterval * prevEase);
    }

    // SM-2 ease adjustment: +0.1 for easy, -0.15 for hard, 0 for good
    const easeDelta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
    newEase = Math.max(MIN_EASE, prevEase + easeDelta);
  }

  // Easy bonus: collapse first two intervals for very easy cards
  if (rating === 'easy' && newReps <= 2) {
    newInterval = Math.max(newInterval, 4);
  }

  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  const status = deriveStatus(newReps, newInterval);

  return {
    intervalDays: newInterval,
    easeFactor: parseFloat(newEase.toFixed(4)),
    repetitions: newReps,
    status,
    nextReviewDate,
  };
}

function deriveStatus(repetitions: number, intervalDays: number): StudyProgress['status'] {
  if (repetitions === 0) return 'new';
  if (intervalDays < 1) return 'learning';
  if (intervalDays >= 21) return 'mastered';
  return 'review';
}

/**
 * Returns true if the card is due for review today.
 * Used to filter the study queue on page load.
 */
export function isDue(nextReviewDate: Date | null, now: Date = new Date()): boolean {
  if (!nextReviewDate) return true; // New card — always due
  return nextReviewDate <= now;
}

/**
 * Returns a human-readable label for the next interval.
 * Used in the rating buttons to show preview (like Anki).
 */
export function previewInterval(
  current: Pick<StudyProgress, 'easeFactor' | 'intervalDays' | 'repetitions'> | null,
  rating: Rating,
): string {
  const result = calculateSm2(current, rating);
  const days = result.intervalDays;
  if (days < 1) return '<1d';
  if (days === 1) return '1d';
  if (days < 30) return `${days}d`;
  const weeks = Math.round(days / 7);
  if (weeks < 8) return `${weeks}w`;
  const months = Math.round(days / 30);
  return `${months}m`;
}
