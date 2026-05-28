/**
 * Study Session Store
 *
 * Tracks the active study session with dynamic re-queueing.
 * Cards are evaluated based on their nextReviewDate relative to 'now'.
 */

import { createStore } from '@/core/store';
import type { Flashcard, StudyProgress } from '@shared/contracts';
import { isDue } from './domain/sm2';
import { toDate } from '@/shared/utils/to-date';

export interface SessionCard {
  card: Flashcard;
  progress: StudyProgress | null; // null = brand new card
}

export interface SessionState {
  /** All cards available in this study session */
  pool: SessionCard[];
  /** Current time, updated periodically to trigger due cards */
  now: number;
  /** Index of the card currently being reviewed. If null, we might be waiting or done. */
  currentCardId: string | null;
  /** Whether the answer side is visible */
  isAnswerRevealed: boolean;
  /** Whether a rating is being submitted */
  isSubmitting: boolean;
  /** Session stats */
  stats: {
    total: number;
    reviewed: number;
    correct: number;
    wrong: number;
  };
  error: string | null;
}

const initialState: SessionState = {
  pool: [],
  now: Date.now(),
  currentCardId: null,
  isAnswerRevealed: false,
  isSubmitting: false,
  stats: { total: 0, reviewed: 0, correct: 0, wrong: 0 },
  error: null,
};

export const useSessionStore = createStore<SessionState>(initialState);

// ── Actions ───────────────────────────────────────────────────────────────────

export const sessionActions = {
  startSession: (pool: SessionCard[]) => {
    useSessionStore.setState({
      pool,
      now: Date.now(),
      currentCardId: null,
      isAnswerRevealed: false,
      isSubmitting: false,
      stats: { total: pool.length, reviewed: 0, correct: 0, wrong: 0 },
      error: null,
    });
    sessionActions.pickNextCard();
  },

  tick: () => {
    useSessionStore.setState({ now: Date.now() });
    // Try to pick next card if we are currently waiting for one
    const state = useSessionStore.getState();
    if (!state.currentCardId) {
      sessionActions.pickNextCard();
    }
  },

  pickNextCard: () => {
    useSessionStore.setState((state) => {
      // Find cards that are due or new
      const dueCards = state.pool.filter(c => {
        if (!c.progress) return true; // new
        return isDue(toDate(c.progress.nextReviewDate), new Date(state.now));
      });

      if (dueCards.length > 0) {
        // Sort by nextReviewDate ascending (most overdue first), new cards (null) at the end
        dueCards.sort((a, b) => {
          if (!a.progress) return 1;
          if (!b.progress) return -1;
          const aDate = toDate(a.progress.nextReviewDate)?.getTime() ?? 0;
          const bDate = toDate(b.progress.nextReviewDate)?.getTime() ?? 0;
          return aDate - bDate;
        });

        // Optimization: prevent same card from showing up twice in a row if there are other due cards
        let nextCard = dueCards[0]!;
        if (dueCards.length > 1 && nextCard.card.id === state.currentCardId) {
          nextCard = dueCards[1]!;
        }

        return { currentCardId: nextCard.card.id ?? null, isAnswerRevealed: false };
      }

      // No due cards right now, we wait
      return { currentCardId: null, isAnswerRevealed: false };
    });
  },

  revealAnswer: () => {
    useSessionStore.setState({ isAnswerRevealed: true });
  },

  setSubmitting: (isSubmitting: boolean) => {
    useSessionStore.setState({ isSubmitting });
  },

  recordRating: (cardId: string, updatedProgress: StudyProgress, isCorrect: boolean) => {
    useSessionStore.setState((state) => {
      const nextStats = {
        ...state.stats,
        reviewed: state.stats.reviewed + 1,
        correct: state.stats.correct + (isCorrect ? 1 : 0),
        wrong: state.stats.wrong + (isCorrect ? 0 : 1),
      };

      // Update card in pool
      const pool = state.pool.map(c => 
        c.card.id === cardId ? { ...c, progress: updatedProgress } : c
      );

      return {
        stats: nextStats,
        pool,
        isSubmitting: false,
      };
    });
    
    // Pick next card
    sessionActions.pickNextCard();
  },

  setError: (error: string) => {
    useSessionStore.setState({ error, isSubmitting: false });
  },

  reset: () => {
    useSessionStore.setState(initialState);
  },
};

// ── Selectors ─────────────────────────────────────────────────────────────────

export const sessionSelectors = {
  currentCard: (state: SessionState): SessionCard | null => {
    if (!state.currentCardId) return null;
    return state.pool.find(c => c.card.id === state.currentCardId) ?? null;
  },

  // The session is "complete" only if all cards in the pool are reviewed and pushed far into the future.
  // In intensive study, "far into the future" could mean >= 4h (240 mins).
  // For now, if currentCardId is null and pool > 0, it means we are waiting.
  isWaiting: (state: SessionState): boolean =>
    state.pool.length > 0 && state.currentCardId === null,

  isComplete: (state: SessionState): boolean =>
    state.pool.length === 0, // In this model, we never really complete until we stop, but just to satisfy typing

  progressPercent: (state: SessionState): number =>
    state.stats.total === 0
      ? 0
      : Math.round((state.stats.reviewed / state.stats.total) * 100),
};
