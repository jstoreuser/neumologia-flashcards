/**
 * Admin Async Actions (Orchestration)
 * 
 * Bridges the UI, Store, and Service.
 * Implements AbortControllers, Optimistic Updates, and Background SWR.
 */

import { useAdminStore, adminActions } from './store';
import {
  adminGetFlashcardsPage,
  adminGetUsers,
  adminSoftDeleteFlashcard,
  adminRestoreFlashcard,
  adminUpdateFlashcard,
  adminCreateFlashcard,
  adminSetRole,
} from './admin.service';
import type { Flashcard, UserProfile } from '@shared/contracts';
import { toast } from '@/core/services/toast.service';

// Singleton AbortControllers for active fetches
let activeCardsFetch: AbortController | null = null;
let activeUsersFetch: AbortController | null = null;

// Debounced SWR revalidation
let revalTimeout: number | null = null;

export async function fetchFlashcards(reset = false) {
  const state = useAdminStore.getState();
  
  if (activeCardsFetch) {
    activeCardsFetch.abort();
  }
  activeCardsFetch = new AbortController();

  const reqId = crypto.randomUUID();
  adminActions.setRequestId(reqId);
  adminActions.markFetchStart('flashcards');

  if (state.flashcardsStatus === 'idle' || reset) {
    adminActions.setFlashcardsStatus('loading');
  } else {
    adminActions.setFlashcardsStatus('refreshing');
  }

  const cursor = reset ? undefined : state.lastVisibleCard ?? undefined;
  const result = await adminGetFlashcardsPage(cursor, activeCardsFetch.signal);

  // Anti-stale or aborted
  if (useAdminStore.getState().currentRequestId !== reqId || result.success === false) {
    if (result.success === false && result.error.message !== 'aborted') {
      adminActions.setFlashcardsStatus('error', result.error.message);
    }
    return;
  }

  adminActions.markFetchComplete('flashcards');
  if (reset) {
    adminActions.setFlashcards(result.data.data, result.data.lastVisible, result.data.hasMore);
  } else {
    adminActions.appendFlashcards(result.data.data, result.data.lastVisible, result.data.hasMore);
  }
}

export async function fetchUsers() {
  if (activeUsersFetch) {
    activeUsersFetch.abort();
  }
  activeUsersFetch = new AbortController();

  adminActions.markFetchStart('users');
  const state = useAdminStore.getState();
  
  if (state.usersStatus === 'idle') {
    adminActions.setUsersStatus('loading');
  } else {
    adminActions.setUsersStatus('refreshing');
  }

  const result = await adminGetUsers(activeUsersFetch.signal);

  if (!result.success) {
    if (result.error.message !== 'aborted') {
      adminActions.setUsersStatus('error', result.error.message);
    }
    return;
  }

  adminActions.markFetchComplete('users');
  adminActions.setUsers(result.data, null, false);
}

export function revalidateResource(resource: 'flashcards' | 'users', options = { debounceMs: 1500 }) {
  if (revalTimeout) window.clearTimeout(revalTimeout);
  revalTimeout = window.setTimeout(() => {
    if (resource === 'flashcards') fetchFlashcards(true);
    else fetchUsers();
  }, options.debounceMs);
}

// ── Optimistic Mutators ────────────────────────────────────────────────────────

export async function toggleFlashcardDelete(card: Flashcard) {
  const cardId = card.id;
  if (!cardId) return; // guard: no-op for entities without a persisted id

  const isDeleted = !card.isDeleted;
  const opId = crypto.randomUUID();

  // 1. Snapshot for rollback
  const previousValues = { isDeleted: card.isDeleted };

  // 2. Optimistic local update
  adminActions.startOperation(opId, isDeleted ? 'delete' : 'restore', cardId);
  adminActions.updateFlashcardLocal(cardId, { isDeleted });

  // 3. Network call
  const result = isDeleted
    ? await adminSoftDeleteFlashcard(cardId)
    : await adminRestoreFlashcard(cardId);

  // 4. Evaluate and rollback if needed
  if (!result.success) {
    adminActions.updateFlashcardLocal(cardId, previousValues);
    toast.error(result.error.message);
  } else {
    revalidateResource('flashcards');
  }

  adminActions.finishOperation(opId);
}

export async function toggleUserRole(user: UserProfile) {
  const newIsAdmin = user.role !== 'admin';
  const newRole = newIsAdmin ? 'admin' : 'student';
  const opId = crypto.randomUUID();

  // 1. Snapshot
  const previousValues = { role: user.role };

  // 2. Local Update
  adminActions.startOperation(opId, 'update', user.uid);
  adminActions.updateUserLocal(user.uid, { role: newRole as any });

  // 3. Network Call
  const result = await adminSetRole(user.uid, newIsAdmin);

  // 4. Result evaluation
  if (!result.success) {
    adminActions.updateUserLocal(user.uid, previousValues);
    toast.error(result.error.message);
  } else {
    toast.success(`Papel alterado para ${newRole}.`);
    revalidateResource('users');
  }

  adminActions.finishOperation(opId);
}

export async function saveFlashcard(id: string | null, data: Partial<Flashcard>) {
  const isCreate = !id;
  adminActions.setSaving(true);
  adminActions.setEditorError(null);

  if (isCreate) {
    const result = await adminCreateFlashcard(data as any);
    if (!result.success) {
      adminActions.setEditorError(result.error.message);
      return;
    }
    toast.success('Flashcard criado com sucesso!');
    adminActions.upsertFlashcard({ ...data, id: result.data, isDeleted: false, schemaVersion: 1, createdAt: new Date() } as any);
  } else {
    const result = await adminUpdateFlashcard(id!, data as any);
    if (!result.success) {
      adminActions.setEditorError(result.error.message);
      return;
    }
    toast.success('Alterações salvas com sucesso!');
    adminActions.updateFlashcardLocal(id!, data);
  }

  adminActions.closeEditor();
}
