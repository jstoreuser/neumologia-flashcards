/**
 * Admin Service
 *
 * Pure API layer. Never mutates the store directly.
 * All functions return a strict Result<T, AppError> pattern.
 * Uses AbortSignal for fetch cancellation.
 */

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/core/services/firebase';
import { telemetry } from '@/core/services/telemetry';
import {
  FlashcardSchema,
  UserProfileSchema,
  type Flashcard,
  type CreateFlashcardDto,
  type UpdateFlashcardDto,
  type UserProfile,
  type Result,
  type AppError,
} from '@shared/contracts';

const PAGE_SIZE = 50;

function createError(message: string, details?: unknown): AppError {
  return { message, details };
}

// ── Flashcard CRUD ────────────────────────────────────────────────────────────

export async function adminGetFlashcardsPage(
  lastVisible?: QueryDocumentSnapshot,
  signal?: AbortSignal,
): Promise<Result<{ data: Flashcard[]; lastVisible: QueryDocumentSnapshot | null; hasMore: boolean }>> {
  try {
    const coll = collection(db, 'flashcards');
    const q = lastVisible
      ? query(coll, orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(PAGE_SIZE))
      : query(coll, orderBy('createdAt', 'desc'), limit(PAGE_SIZE));

    // AbortController logic mapping
    if (signal?.aborted) throw new Error('aborted');

    const snapshot = await getDocs(q);
    
    if (signal?.aborted) throw new Error('aborted');

    const data = snapshot.docs.reduce<Flashcard[]>((acc, d) => {
      const parsed = FlashcardSchema.safeParse({ id: d.id, ...d.data() });
      if (!parsed.success) {
        telemetry.captureError(new Error(`Malformed flashcard: ${d.id}`), {
          feature: 'admin',
          operation: 'parse-flashcard',
          documentId: d.id,
          details: parsed.error.issues,
        });
      } else {
        acc.push(parsed.data);
      }
      return acc;
    }, []);

    return {
      success: true,
      data: {
        data,
        lastVisible: snapshot.docs[snapshot.docs.length - 1] ?? null,
        hasMore: snapshot.docs.length === PAGE_SIZE,
      }
    };
  } catch (err: any) {
    if (err.message === 'aborted') return { success: false, error: createError('aborted') };
    telemetry.captureError(err, { feature: 'admin', operation: 'fetch-flashcards' });
    return { success: false, error: createError('Failed to load flashcards', err) };
  }
}

export async function adminCreateFlashcard(dto: CreateFlashcardDto): Promise<Result<string>> {
  try {
    const coll = collection(db, 'flashcards');
    const ref = await addDoc(coll, {
      ...dto,
      isDeleted: false,
      schemaVersion: 1,
      order: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: ref.id };
  } catch (err: any) {
    return { success: false, error: createError('Falha ao criar card', err) };
  }
}

export async function adminUpdateFlashcard(id: string, dto: UpdateFlashcardDto): Promise<Result<void>> {
  try {
    const ref = doc(db, 'flashcards', id);
    await updateDoc(ref, {
      ...dto,
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: undefined };
  } catch (err: any) {
    return { success: false, error: createError('Falha ao atualizar card', err) };
  }
}

export async function adminSoftDeleteFlashcard(id: string): Promise<Result<void>> {
  try {
    const ref = doc(db, 'flashcards', id);
    await updateDoc(ref, { isDeleted: true, updatedAt: serverTimestamp() });
    return { success: true, data: undefined };
  } catch (err: any) {
    return { success: false, error: createError('Falha ao deletar card', err) };
  }
}

export async function adminRestoreFlashcard(id: string): Promise<Result<void>> {
  try {
    const ref = doc(db, 'flashcards', id);
    await updateDoc(ref, { isDeleted: false, updatedAt: serverTimestamp() });
    return { success: true, data: undefined };
  } catch (err: any) {
    return { success: false, error: createError('Falha ao restaurar card', err) };
  }
}

// ── User Management ───────────────────────────────────────────────────────────

export async function adminGetUsers(signal?: AbortSignal): Promise<Result<UserProfile[]>> {
  try {
    const coll = collection(db, 'users');
    if (signal?.aborted) throw new Error('aborted');

    const snapshot = await getDocs(query(coll, orderBy('createdAt', 'desc'), limit(200)));
    
    if (signal?.aborted) throw new Error('aborted');

    const users = snapshot.docs.reduce<UserProfile[]>((acc, d) => {
      const parsed = UserProfileSchema.safeParse({ uid: d.id, ...d.data() });
      if (!parsed.success) {
        telemetry.captureError(new Error(`Malformed user: ${d.id}`), {
          feature: 'admin',
          operation: 'parse-user',
          documentId: d.id,
          details: parsed.error.issues,
        });
      } else {
        acc.push(parsed.data);
      }
      return acc;
    }, []);

    return { success: true, data: users };
  } catch (err: any) {
    if (err.message === 'aborted') return { success: false, error: createError('aborted') };
    telemetry.captureError(err, { feature: 'admin', operation: 'fetch-users' });
    return { success: false, error: createError('Falha ao carregar usuários', err) };
  }
}

export async function adminSetRole(uid: string, isAdmin: boolean): Promise<Result<void>> {
  try {
    const setAdminRole = httpsCallable<{ uid: string; isAdmin: boolean }, { success: boolean }>(
      functions,
      'setAdminRole',
    );
    const result = await setAdminRole({ uid, isAdmin });
    if (!result.data.success) {
      throw new Error('setAdminRole returned unsuccessful response');
    }
    return { success: true, data: undefined };
  } catch (err: any) {
    return { success: false, error: createError('Falha ao alterar permissão', err) };
  }
}
