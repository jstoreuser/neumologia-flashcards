import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  limit,
  where,
  Firestore,
} from 'firebase/firestore';
import type { z } from 'zod';
import { type Flashcard, FlashcardSchema } from '@shared/contracts';
import { RepositoryError } from '@/core/errors';
import { parseDoc, parseDocs } from '@/shared/utils/firestore-parse';

/** Shared malformed-card reporter for this repository. */
const onMalformed = (id: string, error: z.ZodError) =>
  console.warn('[BARCL] Malformed flashcard skipped:', id, error.format());

/**
 * Safety cap on how many cards the study app loads in one go.
 * The deck is small today; this only prevents a pathological load if the
 * collection ever grows huge. The study session needs the full pool to
 * schedule reviews, so there is no pagination — just raise this number if
 * your published-card count ever approaches it.
 */
export const STUDY_CARD_LIMIT = 1000;

/**
 * Fetch a single flashcard by ID.
 */
export async function getFlashcardById(db: Firestore, id: string): Promise<Flashcard> {
  try {
    const docRef = doc(db, 'flashcards', id);
    const snapshot = await getDoc(docRef);
    const result = parseDoc(snapshot, FlashcardSchema, { idField: 'id', onError: onMalformed });
    if (!result) throw new RepositoryError('Documento não encontrado ou inválido');
    return result;
  } catch (error) {
    if (error instanceof RepositoryError) throw error;
    throw new RepositoryError('Falha ao buscar flashcard do Firestore');
  }
}

/**
 * Query published, non-deleted flashcards, capped at STUDY_CARD_LIMIT.
 */
export async function getAllFlashcards(
  db: Firestore,
) {
  try {
    const coll = collection(db, 'flashcards');
    // Two equality filters — no composite index required.
    // orderBy is intentionally omitted here; the study session
    // shuffles cards client-side anyway.
    const q = query(
      coll,
      where('isPublished', '==', true),
      where('isDeleted', '==', false),
      limit(STUDY_CARD_LIMIT),
    );

    const snapshot = await getDocs(q);

    return {
      data: parseDocs(snapshot.docs, FlashcardSchema, { idField: 'id', onError: onMalformed }),
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[BARCL] getAllFlashcards failed:', msg);
    throw new RepositoryError(`Falha ao listar flashcards: ${msg}`);
  }
}
