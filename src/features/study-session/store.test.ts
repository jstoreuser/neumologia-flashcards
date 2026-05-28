import { describe, it, expect, beforeEach } from 'vitest';
import {
  useSessionStore,
  sessionActions,
  sessionSelectors,
  type SessionCard,
  type SessionState,
} from './store';
import type { Flashcard, StudyProgress } from '@shared/contracts';

/** Minimal SessionCard — only the fields the completion logic reads. */
const card = (id: string, status?: StudyProgress['status']): SessionCard => ({
  card: { id } as unknown as Flashcard,
  progress: status
    ? ({ status, nextReviewDate: new Date(Date.now() + 1e9) } as unknown as StudyProgress)
    : null,
});

const stateWith = (pool: SessionCard[], forceContinue = false): SessionState => ({
  pool,
  now: Date.now(),
  currentCardId: null,
  isAnswerRevealed: false,
  isSubmitting: false,
  forceContinue,
  stats: { total: pool.length, reviewed: 0, correct: 0, wrong: 0 },
  error: null,
});

describe('sessionSelectors.isComplete', () => {
  it('is false for an empty pool', () => {
    expect(sessionSelectors.isComplete(stateWith([]))).toBe(false);
  });

  it('is true only when every card is mastered', () => {
    expect(sessionSelectors.isComplete(stateWith([card('a', 'mastered'), card('b', 'mastered')]))).toBe(true);
    expect(sessionSelectors.isComplete(stateWith([card('a', 'mastered'), card('b', 'review')]))).toBe(false);
    expect(sessionSelectors.isComplete(stateWith([card('a', 'learning')]))).toBe(false);
  });

  it('is false for a brand-new card (no progress)', () => {
    expect(sessionSelectors.isComplete(stateWith([card('a')]))).toBe(false);
  });

  it('is overridden to false when forceContinue is set', () => {
    expect(sessionSelectors.isComplete(stateWith([card('a', 'mastered')], true))).toBe(false);
  });
});

describe('sessionActions.continueStudying', () => {
  beforeEach(() => sessionActions.reset());

  it('overrides completion and resumes with a card from the pool', () => {
    sessionActions.startSession([card('m1', 'mastered'), card('m2', 'mastered')]);
    // All mastered, nothing due → session reads as complete.
    expect(sessionSelectors.isComplete(useSessionStore.getState())).toBe(true);

    sessionActions.continueStudying();
    const s = useSessionStore.getState();
    expect(s.forceContinue).toBe(true);
    expect(sessionSelectors.isComplete(s)).toBe(false);
    expect(s.currentCardId).not.toBeNull();
  });
});
