import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  limit,
  orderBy,
  startAfter,
  where,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  Firestore,
} from 'firebase/firestore';
import { z } from 'zod';
import { Flashcard, FlashcardSchema } from '@shared/contracts';
import { RepositoryError } from '@/core/errors';

/**
 * Zod Guard: Parses a Firestore snapshot into a Flashcard.
 * Returns null for invalid/malformed documents instead of throwing,
 * so one bad card never breaks the entire list.
 */
function parseSnapshot(doc: DocumentSnapshot | QueryDocumentSnapshot): Flashcard | null {
  if (!doc.exists()) return null;

  const data = doc.data();
  const parsed = FlashcardSchema.safeParse({ id: doc.id, ...data });

  if (!parsed.success) {
    console.warn('[BARCL] Malformed flashcard skipped:', doc.id, parsed.error.format());
    return null;
  }

  return parsed.data;
}

/**
 * Fetch a single flashcard by ID.
 */
export async function getFlashcardById(db: Firestore, id: string): Promise<Flashcard> {
  try {
    const docRef = doc(db, 'flashcards', id);
    const snapshot = await getDoc(docRef);
    const result = parseSnapshot(snapshot);
    if (!result) throw new RepositoryError('Documento não encontrado ou inválido');
    return result;
  } catch (error) {
    if (error instanceof RepositoryError) throw error;
    throw new RepositoryError('Falha ao buscar flashcard do Firestore');
  }
}

/**
 * Query all flashcards without pagination limits.
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
    );

    const snapshot = await getDocs(q);

    return {
      data: snapshot.docs.map(parseSnapshot).filter((c): c is Flashcard => c !== null),
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[BARCL] getAllFlashcards failed:', msg);
    throw new RepositoryError(`Falha ao listar flashcards: ${msg}`);
  }
}
