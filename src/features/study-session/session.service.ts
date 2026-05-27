/**
 * Session Service
 *
 * Orchestrates study sessions:
 * 1. Loads the due card queue from Firestore + merges with progress data
 * 2. Calls SM-2 to calculate next interval after each rating
 * 3. Persists progress to Firestore (user/{uid}/progress/{cardId})
 * 4. Updates the session store
 *
 * No UI logic here. Pure orchestration.
 */

import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from '@/core/services/firebase';
import { calculateSm2, isDue, type Rating } from './domain/sm2';
import { sessionActions, useSessionStore, sessionSelectors, type SessionCard } from './store';
import { flashcardActions, useFlashcardStore } from '@/features/flashcards/store';
import { StudyProgressSchema, type StudyProgress } from '@shared/contracts';
import { telemetry } from '@/core/services/telemetry';
import { ProgressCache } from '@/core/cache/cache-manager';

const SESSION_SIZE = 20; // cards per session

// ── Session Initialization ────────────────────────────────────────────────────

/**
 * Loads cards due for review for the current user and starts a session.
 * Merges the card list with existing progress records.
 */
export async function startStudySession(
  user: User,
  specialty: string = 'neumologia',
): Promise<void> {
  flashcardActions.setLoading(true);

  try {
    const cards = useFlashcardStore.getState().cards;
    if (cards.length === 0) {
      sessionActions.setError('Nenhum card carregado. Tente atualizar a página.');
      return;
    }

    // Load progress for all cards in the current set
    const progressMap = await loadProgressMap(user.uid, cards.map(c => c.id ?? ''));

    const now = new Date();

    // Build session queue: due cards first, then new cards
    const dueCards: SessionCard[] = [];
    const newCards: SessionCard[] = [];

    for (const card of cards) {
      if (!card.id) continue;
      const progress = progressMap[card.id] ?? null;
      const nextDate = progress?.nextReviewDate
        ? (progress.nextReviewDate instanceof Date
          ? progress.nextReviewDate
          : typeof progress.nextReviewDate === 'string'
            ? new Date(progress.nextReviewDate)
            : (progress.nextReviewDate as { toDate: () => Date }).toDate())
        : null;

      const sessionCard: SessionCard = { card, progress };

      if (!progress) {
        newCards.push(sessionCard);
      } else if (isDue(nextDate, now)) {
        dueCards.push(sessionCard);
      }
    }

    // Prioritize due cards, fill remainder with new cards, cap at SESSION_SIZE
    const queue = [...dueCards, ...newCards].slice(0, SESSION_SIZE);

    if (queue.length === 0) {
      sessionActions.setError('Parabéns! Nenhum card pendente para hoje. Volte amanhã.');
      return;
    }

    sessionActions.startSession(queue);
  } catch (err) {
    telemetry.captureError(err, { phase: 'startStudySession' });
    sessionActions.setError('Erro ao carregar sessão. Tente novamente.');
  } finally {
    flashcardActions.setLoading(false);
  }
}

// ── Rating Submission ─────────────────────────────────────────────────────────

/**
 * Handles the user rating a card:
 * 1. Calculates SM-2 result
 * 2. Persists to Firestore
 * 3. Advances session state
 */
export async function submitRating(user: User, rating: Rating): Promise<void> {
  const state = useSessionStore.getState();
  const current = sessionSelectors.currentCard(state);

  if (!current || state.isSubmitting) return;

  sessionActions.setSubmitting(true);

  try {
    const { card, progress } = current;
    if (!card.id) throw new Error('Card missing ID');

    const sm2 = calculateSm2(progress, rating);

    const updatedProgress: Omit<StudyProgress, 'cardId' | 'userId'> & {
      cardId: string;
      userId: string;
      updatedAt: ReturnType<typeof serverTimestamp>;
    } = {
      cardId: card.id,
      userId: user.uid,
      easeFactor: sm2.easeFactor,
      intervalDays: sm2.intervalDays,
      repetitions: sm2.repetitions,
      status: sm2.status,
      nextReviewDate: sm2.nextReviewDate,
      totalReviews: (progress?.totalReviews ?? 0) + 1,
      correctStreak: rating !== 'wrong'
        ? (progress?.correctStreak ?? 0) + 1
        : 0,
      lastReviewedAt: new Date(),
      lastRating: rating,
      updatedAt: serverTimestamp(),
    };

    // Persist to Firestore: users/{uid}/progress/{cardId}
    const ref = doc(db, 'users', user.uid, 'progress', card.id);
    await setDoc(ref, updatedProgress, { merge: true });

    // Invalidate progress cache for this user
    ProgressCache.invalidate(user.uid);

    // Advance session state
    sessionActions.recordRating(rating);
  } catch (err) {
    telemetry.captureError(err, { phase: 'submitRating' });
    sessionActions.setError('Erro ao salvar progresso. Sua resposta não foi registrada.');
  }
}

// ── Progress Loading ──────────────────────────────────────────────────────────

async function loadProgressMap(
  uid: string,
  cardIds: string[],
): Promise<Record<string, StudyProgress>> {
  // Check cache first
  const cached = ProgressCache.get(uid);
  if (cached) return cached as Record<string, StudyProgress>;

  const progressRef = collection(db, 'users', uid, 'progress');
  const snapshot = await getDocs(progressRef);

  const map: Record<string, StudyProgress> = {};
  for (const docSnap of snapshot.docs) {
    const parsed = StudyProgressSchema.safeParse(docSnap.data());
    if (parsed.success) {
      map[docSnap.id] = parsed.data;
    }
  }

  ProgressCache.set(uid, map as Record<string, unknown>);
  return map;
}
