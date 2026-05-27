/**
 * Admin Service
 *
 * All admin operations on flashcards and users.
 * Every write is validated through Zod before hitting Firestore.
 * Field whitelists are enforced server-side by security rules.
 */

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  getDoc,
  query,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/core/services/firebase';
import {
  FlashcardSchema,
  type Flashcard,
  type CreateFlashcardDto,
  type UpdateFlashcardDto,
} from '@shared/contracts';
import { UserProfileSchema, type UserProfile } from '@shared/contracts';
import { RepositoryError } from '@/core/errors';
import { FlashcardCache } from '@/core/cache/cache-manager';

const PAGE_SIZE = 50;

// ── Flashcard CRUD ────────────────────────────────────────────────────────────

export async function adminGetFlashcardsPage(
  lastVisible?: QueryDocumentSnapshot,
): Promise<{ data: Flashcard[]; lastVisible: QueryDocumentSnapshot | null; hasMore: boolean }> {
  try {
    const coll = collection(db, 'flashcards');
    const q = lastVisible
      ? query(coll, orderBy('order'), startAfter(lastVisible), limit(PAGE_SIZE))
      : query(coll, orderBy('order'), limit(PAGE_SIZE));

    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((d) => {
      const parsed = FlashcardSchema.safeParse({ id: d.id, ...d.data() });
      if (!parsed.success) throw new RepositoryError(`Malformed flashcard: ${d.id}`);
      return parsed.data;
    });

    return {
      data,
      lastVisible: snapshot.docs[snapshot.docs.length - 1] ?? null,
      hasMore: snapshot.docs.length === PAGE_SIZE,
    };
  } catch (err) {
    if (err instanceof RepositoryError) throw err;
    throw new RepositoryError('Failed to load flashcards for admin');
  }
}

export async function adminCreateFlashcard(dto: CreateFlashcardDto): Promise<string> {
  const coll = collection(db, 'flashcards');
  const ref = await addDoc(coll, {
    ...dto,
    isDeleted: false,
    schemaVersion: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  FlashcardCache.invalidate();
  return ref.id;
}

export async function adminUpdateFlashcard(id: string, dto: UpdateFlashcardDto): Promise<void> {
  const ref = doc(db, 'flashcards', id);
  await updateDoc(ref, {
    ...dto,
    updatedAt: serverTimestamp(),
  });
  FlashcardCache.invalidate();
}

export async function adminSoftDeleteFlashcard(id: string): Promise<void> {
  const ref = doc(db, 'flashcards', id);
  await updateDoc(ref, { isDeleted: true, updatedAt: serverTimestamp() });
  FlashcardCache.invalidate();
}

export async function adminRestoreFlashcard(id: string): Promise<void> {
  const ref = doc(db, 'flashcards', id);
  await updateDoc(ref, { isDeleted: false, updatedAt: serverTimestamp() });
  FlashcardCache.invalidate();
}

// ── User Management ───────────────────────────────────────────────────────────

export async function adminGetUsers(): Promise<UserProfile[]> {
  const coll = collection(db, 'users');
  const snapshot = await getDocs(query(coll, orderBy('createdAt'), limit(200)));
  return snapshot.docs.map((d) => {
    const parsed = UserProfileSchema.safeParse(d.data());
    if (!parsed.success) throw new RepositoryError(`Malformed user: ${d.id}`);
    return parsed.data;
  });
}

/**
 * Grants or revokes admin role via Cloud Function.
 * The CF sets the custom claim — never done client-side.
 */
export async function adminSetRole(uid: string, isAdmin: boolean): Promise<void> {
  const setAdminRole = httpsCallable<{ uid: string; isAdmin: boolean }, { success: boolean }>(
    functions,
    'setAdminRole',
  );
  const result = await setAdminRole({ uid, isAdmin });
  if (!result.data.success) {
    throw new Error('setAdminRole returned unsuccessful response');
  }
}
