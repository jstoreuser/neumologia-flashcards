/**
 * Study Session Store
 *
 * Tracks the active study session: which cards are queued,
 * current card index, answer state, and session stats.
 *
 * Separate from the FlashcardStore (which owns the full card list).
 * This store owns the session-specific runtime state only.
 */

import { createStore } from '@/core/store';
import type { Flashcard, StudyProgress } from '@shared/contracts';
import type { Rating } from './domain/sm2';

export interface SessionCard {
  card: Flashcard;
  progress: StudyProgress | null; // null = brand new card
}

export interface SessionState {
  /** Cards queued for this session in order */
  queue: SessionCard[];
  /** Index of the currently shown card */
  currentIndex: number;
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
  /** Non-null when session is complete */
  completedAt: Date | null;
  error: string | null;
}

const initialState: SessionState = {
  queue: [],
  currentIndex: 0,
  isAnswerRevealed: false,
  isSubmitting: false,
  stats: { total: 0, reviewed: 0, correct: 0, wrong: 0 },
  completedAt: null,
  error: null,
};

export const useSessionStore = createStore<SessionState>(initialState);

// ── Actions ───────────────────────────────────────────────────────────────────

export const sessionActions = {
  startSession: (queue: SessionCard[]) => {
    useSessionStore.setState({
      queue,
      currentIndex: 0,
      isAnswerRevealed: false,
      isSubmitting: false,
      stats: { total: queue.length, reviewed: 0, correct: 0, wrong: 0 },
      completedAt: null,
      error: null,
    });
  },

  revealAnswer: () => {
    useSessionStore.setState({ isAnswerRevealed: true });
  },

  setSubmitting: (isSubmitting: boolean) => {
    useSessionStore.setState({ isSubmitting });
  },

  recordRating: (rating: Rating) => {
    useSessionStore.setState((state) => {
      const isCorrect = rating !== 'wrong';
      const nextStats = {
        ...state.stats,
        reviewed: state.stats.reviewed + 1,
        correct: state.stats.correct + (isCorrect ? 1 : 0),
        wrong: state.stats.wrong + (isCorrect ? 0 : 1),
      };

      const nextIndex = state.currentIndex + 1;
      const isComplete = nextIndex >= state.queue.length;

      return {
        stats: nextStats,
        currentIndex: nextIndex,
        isAnswerRevealed: false,
        isSubmitting: false,
        completedAt: isComplete ? new Date() : null,
      };
    });
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
  currentCard: (state: SessionState): SessionCard | null =>
    state.queue[state.currentIndex] ?? null,

  isComplete: (state: SessionState): boolean =>
    state.completedAt !== null,

  progressPercent: (state: SessionState): number =>
    state.stats.total === 0
      ? 0
      : Math.round((state.stats.reviewed / state.stats.total) * 100),
};
