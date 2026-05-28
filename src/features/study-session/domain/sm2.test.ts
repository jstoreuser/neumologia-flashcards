import { describe, it, expect } from 'vitest';
import { calculateSm2, isDue, previewInterval } from './sm2';
import type { StudyProgress } from '@shared/contracts';

const NOW = new Date('2026-01-01T00:00:00.000Z');

type Prev = Pick<StudyProgress, 'intervalDays' | 'intervalMinutes' | 'repetitions'>;
const prev = (intervalMinutes: number, repetitions = 1, intervalDays = 0): Prev => ({
  intervalDays,
  intervalMinutes,
  repetitions,
});

describe('calculateSm2 — first review (no prior progress)', () => {
  it('wrong → 1 minute, resets reps, status new', () => {
    const r = calculateSm2(null, 'wrong', NOW);
    expect(r.intervalMinutes).toBe(1);
    expect(r.repetitions).toBe(0);
    expect(r.status).toBe('new');
    expect(r.nextReviewDate.getTime()).toBe(NOW.getTime() + 1 * 60000);
  });

  it('hard → 10 minutes, status learning', () => {
    const r = calculateSm2(null, 'hard', NOW);
    expect(r.intervalMinutes).toBe(10);
    expect(r.repetitions).toBe(1);
    expect(r.status).toBe('learning');
  });

  it('good → 60 minutes, status review', () => {
    const r = calculateSm2(null, 'good', NOW);
    expect(r.intervalMinutes).toBe(60);
    expect(r.repetitions).toBe(1);
    expect(r.status).toBe('review');
  });

  it('easy → 240 minutes, status mastered', () => {
    const r = calculateSm2(null, 'easy', NOW);
    expect(r.intervalMinutes).toBe(240);
    expect(r.repetitions).toBe(1);
    expect(r.status).toBe('mastered');
  });
});

describe('calculateSm2 — subsequent reviews (multipliers + caps)', () => {
  it('hard multiplies by 1.5 and caps at 60', () => {
    expect(calculateSm2(prev(10), 'hard', NOW).intervalMinutes).toBe(15);
    expect(calculateSm2(prev(50), 'hard', NOW).intervalMinutes).toBe(60); // 75 capped to 60
  });

  it('good multiplies by 2.5, clamps to [60, 240]', () => {
    expect(calculateSm2(prev(60), 'good', NOW).intervalMinutes).toBe(150);
    expect(calculateSm2(prev(200), 'good', NOW).intervalMinutes).toBe(240); // 500 capped
    expect(calculateSm2(prev(10), 'good', NOW).intervalMinutes).toBe(60); // 25 floored to 60
  });

  it('easy multiplies by 4.0 with floor 240 and no upper cap', () => {
    expect(calculateSm2(prev(240), 'easy', NOW).intervalMinutes).toBe(960);
    expect(calculateSm2(prev(10), 'easy', NOW).intervalMinutes).toBe(240); // 40 floored to 240
  });

  it('wrong always resets to 1 minute regardless of history', () => {
    const r = calculateSm2(prev(240, 5), 'wrong', NOW);
    expect(r.intervalMinutes).toBe(1);
    expect(r.repetitions).toBe(0);
    expect(r.status).toBe('new');
  });

  it('increments repetitions for non-wrong ratings', () => {
    expect(calculateSm2(prev(60, 3), 'good', NOW).repetitions).toBe(4);
  });
});

describe('calculateSm2 — legacy intervalDays fallback', () => {
  it('uses intervalDays * 1440 when intervalMinutes is 0', () => {
    // 1 day = 1440 min; good → min(240, max(60, round(1440*2.5))) = 240
    const r = calculateSm2(prev(0, 2, 1), 'good', NOW);
    expect(r.intervalMinutes).toBe(240);
    expect(r.status).toBe('mastered');
  });
});

describe('isDue', () => {
  it('treats a null next-review date as due', () => {
    expect(isDue(null, NOW)).toBe(true);
  });
  it('is due when next review is in the past or exactly now', () => {
    expect(isDue(new Date(NOW.getTime() - 1000), NOW)).toBe(true);
    expect(isDue(new Date(NOW.getTime()), NOW)).toBe(true);
  });
  it('is not due when next review is in the future', () => {
    expect(isDue(new Date(NOW.getTime() + 1000), NOW)).toBe(false);
  });
});

describe('previewInterval — human-readable labels', () => {
  it('renders minutes under an hour', () => {
    expect(previewInterval(null, 'wrong')).toBe('1m');
    expect(previewInterval(null, 'hard')).toBe('10m');
  });
  it('renders hours under a day', () => {
    expect(previewInterval(null, 'good')).toBe('1h');
    expect(previewInterval(null, 'easy')).toBe('4h');
  });
  it('renders days for large legacy intervals', () => {
    expect(previewInterval(prev(0, 3, 1), 'easy')).toBe('4d'); // 1440*4 = 5760m ≈ 4d
  });
});
