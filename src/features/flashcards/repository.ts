import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  limit,
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
 * Zod Guard: Ensures data retrieved from Firestore strictly matches our Domain DTO.
 */
function parseSnapshot(doc: DocumentSnapshot | QueryDocumentSnapshot): Flashcard {
  if (!doc.exists()) {
    throw new RepositoryError('Documento não encontrado');
  }

  const data = doc.data();
  // Inclui o ID do documento na validação para compor a entidade
  const parsed = FlashcardSchema.safeParse({ id: doc.id, ...data });

  if (!parsed.success) {
    console.error('Schema Error on Flashcard:', doc.id, parsed.error.format());
    throw new RepositoryError('Dados do banco de dados corrompidos ou inválidos');
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
    return parseSnapshot(snapshot);
  } catch (error) {
    if (error instanceof RepositoryError) throw error;
    throw new RepositoryError('Falha ao buscar flashcard do Firestore');
  }
}

/**
 * Paginated query avoiding `onSnapshot` cost.
 */
export async function getFlashcardsPage(
  db: Firestore,
  pageSize: number = 20,
  lastVisibleDoc?: QueryDocumentSnapshot,
) {
  try {
    const coll = collection(db, 'flashcards');
    // Em um cenário real, adicionaríamos where() e orderBy() baseados em filtros.
    // Firebase Rules obriga que estudantes só possam ler cards publicados e não-deletados.
    const baseQueryConstraints = [
      where('isPublished', '==', true),
      where('isDeleted', '==', false)
    ];

    const q = lastVisibleDoc
      ? query(coll, ...baseQueryConstraints, startAfter(lastVisibleDoc), limit(pageSize))
      : query(coll, ...baseQueryConstraints, limit(pageSize));

    const snapshot = await getDocs(q);
    
    return {
      data: snapshot.docs.map(parseSnapshot),
      lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === pageSize,
    };
  } catch (error) {
    throw new RepositoryError('Falha ao listar flashcards');
  }
}
