/**
 * Admin Store
 *
 * Separates Server State from UI State. Uses normalized entities and explicit statuses.
 */

import { createStore } from '@/core/store';
import { entityAdapter, type EntityState, createEntityState } from '@/shared/utils/entity-adapter';
import type { Flashcard, UserProfile, ResourceStatus } from '@shared/contracts';
import type { QueryDocumentSnapshot } from 'firebase/firestore';

export type AdminView = 'flashcards' | 'users';
export type EditorMode = 'create' | 'edit';
export type CardSortField = 'id' | 'createdAt' | 'category';
export type SortDir = 'asc' | 'desc';

export interface PendingOperation {
  id: string;
  type: 'delete' | 'publish' | 'update' | 'restore' | 'create';
  entityId: string | null;
  startedAt: number;
}

export interface AdminServerState {
  // Flashcards
  flashcards: EntityState<Flashcard>;
  flashcardsStatus: ResourceStatus;
  flashcardsLastFetchStartedAt: number | null;
  flashcardsLastFetchCompletedAt: number | null;
  flashcardsError: string | null;
  hasMoreCards: boolean;
  lastVisibleCard: QueryDocumentSnapshot | null;

  // Users
  users: EntityState<UserProfile>;
  usersStatus: ResourceStatus;
  usersLastFetchStartedAt: number | null;
  usersLastFetchCompletedAt: number | null;
  usersError: string | null;
  hasMoreUsers: boolean;
  lastVisibleUser: QueryDocumentSnapshot | null;

  // Concurrency
  currentRequestId: string | null;
  pendingOperations: Record<string, PendingOperation>;
}

export interface AdminUIState {
  activeView: AdminView;
  editorOpen: boolean;
  editorMode: EditorMode;
  editingCardId: string | null;
  dirtyFields: Record<string, boolean>;
  isSaving: boolean;
  editorError: string | null;
  cardSortField: CardSortField;
  cardSortDir: SortDir;
}

export type AdminState = AdminServerState & AdminUIState;

const initialState: AdminState = {
  // Server State
  flashcards: createEntityState<Flashcard>(),
  flashcardsStatus: 'idle',
  flashcardsLastFetchStartedAt: null,
  flashcardsLastFetchCompletedAt: null,
  flashcardsError: null,
  hasMoreCards: true,
  lastVisibleCard: null,

  users: createEntityState<UserProfile>(),
  usersStatus: 'idle',
  usersLastFetchStartedAt: null,
  usersLastFetchCompletedAt: null,
  usersError: null,
  hasMoreUsers: true,
  lastVisibleUser: null,

  currentRequestId: null,
  pendingOperations: {},

  // UI State
  activeView: 'flashcards',
  editorOpen: false,
  editorMode: 'create',
  editingCardId: null,
  dirtyFields: {},
  isSaving: false,
  editorError: null,
  cardSortField: 'id',
  cardSortDir: 'asc',
};

export const useAdminStore = createStore<AdminState>(initialState);

export const adminActions = {
  // ── UI Actions ─────────────────────────────────────────────────────────────
  setView: (view: AdminView) => {
    useAdminStore.setState({ activeView: view });
  },

  openCreateEditor: () => {
    useAdminStore.setState({ 
      editorOpen: true, 
      editorMode: 'create', 
      editingCardId: null,
      dirtyFields: {},
      isSaving: false,
      editorError: null 
    });
  },

  openEditEditor: (cardId: string) => {
    useAdminStore.setState({ 
      editorOpen: true, 
      editorMode: 'edit', 
      editingCardId: cardId,
      dirtyFields: {},
      isSaving: false,
      editorError: null
    });
  },

  closeEditor: () => {
    useAdminStore.setState({ 
      editorOpen: false, 
      editingCardId: null, 
      dirtyFields: {},
      isSaving: false,
      editorError: null
    });
  },

  setSaving: (isSaving: boolean) => {
    useAdminStore.setState({ isSaving });
  },

  setEditorError: (error: string | null) => {
    useAdminStore.setState({ editorError: error, isSaving: false });
  },

  setDirtyField: (field: string, isDirty: boolean) => {
    useAdminStore.setState(s => ({
      dirtyFields: { ...s.dirtyFields, [field]: isDirty }
    }));
  },

  // ── Concurrency & Lifecycle ────────────────────────────────────────────────
  startOperation: (id: string, type: PendingOperation['type'], entityId: string | null = null) => {
    useAdminStore.setState(s => ({
      pendingOperations: {
        ...s.pendingOperations,
        [id]: { id, type, entityId, startedAt: Date.now() }
      }
    }));
  },

  finishOperation: (id: string) => {
    useAdminStore.setState(s => {
      const next = { ...s.pendingOperations };
      delete next[id];
      return { pendingOperations: next };
    });
  },

  setRequestId: (id: string) => {
    useAdminStore.setState({ currentRequestId: id });
  },

  // ── Server Actions (Reducers) ──────────────────────────────────────────────
  setFlashcardsStatus: (status: ResourceStatus, error: string | null = null) => {
    useAdminStore.setState({ flashcardsStatus: status, flashcardsError: error });
  },

  setUsersStatus: (status: ResourceStatus, error: string | null = null) => {
    useAdminStore.setState({ usersStatus: status, usersError: error });
  },

  markFetchStart: (resource: 'flashcards' | 'users') => {
    useAdminStore.setState(resource === 'flashcards' 
      ? { flashcardsLastFetchStartedAt: Date.now() } 
      : { usersLastFetchStartedAt: Date.now() }
    );
  },

  markFetchComplete: (resource: 'flashcards' | 'users') => {
    useAdminStore.setState(resource === 'flashcards' 
      ? { flashcardsLastFetchCompletedAt: Date.now() } 
      : { usersLastFetchCompletedAt: Date.now() }
    );
  },

  setFlashcards: (cards: Flashcard[], lastVisible: QueryDocumentSnapshot | null, hasMore: boolean) => {
    useAdminStore.setState(s => ({
      flashcards: entityAdapter.setAll(cards),
      lastVisibleCard: lastVisible,
      hasMoreCards: hasMore,
      flashcardsStatus: 'ready'
    }));
  },

  appendFlashcards: (more: Flashcard[], lastVisible: QueryDocumentSnapshot | null, hasMore: boolean) => {
    useAdminStore.setState(s => ({
      flashcards: entityAdapter.setMany(s.flashcards, more),
      lastVisibleCard: lastVisible,
      hasMoreCards: hasMore,
      flashcardsStatus: 'ready'
    }));
  },

  upsertFlashcard: (card: Flashcard) => {
    useAdminStore.setState(s => ({
      flashcards: entityAdapter.upsertOne(s.flashcards, card)
    }));
  },

  updateFlashcardLocal: (id: string, changes: Partial<Flashcard>) => {
    useAdminStore.setState(s => ({
      flashcards: entityAdapter.updateOne(s.flashcards, id, changes)
    }));
  },

  removeFlashcard: (id: string) => {
    useAdminStore.setState(s => ({
      flashcards: entityAdapter.removeOne(s.flashcards, id)
    }));
  },

  setUsers: (users: UserProfile[], lastVisible: QueryDocumentSnapshot | null, hasMore: boolean) => {
    useAdminStore.setState({
      users: entityAdapter.setAll(users),
      lastVisibleUser: lastVisible,
      hasMoreUsers: hasMore,
      usersStatus: 'ready'
    });
  },

  updateUserLocal: (uid: string, changes: Partial<UserProfile>) => {
    useAdminStore.setState(s => ({
      users: entityAdapter.updateOne(s.users, uid, changes)
    }));
  },

  setCardSort: (field: CardSortField) => {
    useAdminStore.setState(s => ({
      cardSortField: field,
      // Same column → toggle direction; new column → reset to asc
      cardSortDir: s.cardSortField === field
        ? (s.cardSortDir === 'asc' ? 'desc' : 'asc')
        : 'asc',
    }));
  },
};
