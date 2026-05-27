/**
 * Admin Store
 *
 * Owns the UI state for the admin panel.
 * Split from the main flashcard store to avoid cross-concern pollution.
 */

import { createStore } from '@/core/store';
import type { Flashcard } from '@shared/contracts';
import type { UserProfile } from '@shared/contracts';
import type { QueryDocumentSnapshot } from 'firebase/firestore';

export type AdminView = 'flashcards' | 'users';
export type EditorMode = 'create' | 'edit';

export interface AdminState {
  activeView: AdminView;
  // Flashcard list
  flashcards: Flashcard[];
  isLoadingCards: boolean;
  hasMoreCards: boolean;
  lastVisibleCard: QueryDocumentSnapshot | null;
  // User list
  users: UserProfile[];
  isLoadingUsers: boolean;
  // Editor modal
  editorOpen: boolean;
  editorMode: EditorMode;
  editingCard: Flashcard | null;
  isSaving: boolean;
  // Feedback
  error: string | null;
  successMessage: string | null;
}

const initialState: AdminState = {
  activeView: 'flashcards',
  flashcards: [],
  isLoadingCards: false,
  hasMoreCards: true,
  lastVisibleCard: null,
  users: [],
  isLoadingUsers: false,
  editorOpen: false,
  editorMode: 'create',
  editingCard: null,
  isSaving: false,
  error: null,
  successMessage: null,
};

export const useAdminStore = createStore<AdminState>(initialState);

export const adminActions = {
  setView: (view: AdminView) => {
    useAdminStore.setState({ activeView: view, error: null });
  },

  setCards: (flashcards: Flashcard[], lastVisible: QueryDocumentSnapshot | null, hasMore: boolean) => {
    useAdminStore.setState({ flashcards, lastVisibleCard: lastVisible, hasMoreCards: hasMore, isLoadingCards: false });
  },

  appendCards: (more: Flashcard[], lastVisible: QueryDocumentSnapshot | null, hasMore: boolean) => {
    useAdminStore.setState((s) => ({
      flashcards: [...s.flashcards, ...more],
      lastVisibleCard: lastVisible,
      hasMoreCards: hasMore,
      isLoadingCards: false,
    }));
  },

  setUsers: (users: UserProfile[]) => {
    useAdminStore.setState({ users, isLoadingUsers: false });
  },

  openCreateEditor: () => {
    useAdminStore.setState({ editorOpen: true, editorMode: 'create', editingCard: null, error: null });
  },

  openEditEditor: (card: Flashcard) => {
    useAdminStore.setState({ editorOpen: true, editorMode: 'edit', editingCard: card, error: null });
  },

  closeEditor: () => {
    useAdminStore.setState({ editorOpen: false, editingCard: null, isSaving: false, error: null });
  },

  setSaving: (isSaving: boolean) => {
    useAdminStore.setState({ isSaving });
  },

  upsertCard: (card: Flashcard) => {
    useAdminStore.setState((s) => {
      const idx = s.flashcards.findIndex(c => c.id === card.id);
      const next = idx >= 0
        ? s.flashcards.map((c, i) => i === idx ? card : c)
        : [card, ...s.flashcards];
      return { flashcards: next, editorOpen: false, isSaving: false, successMessage: 'Card salvo com sucesso.' };
    });
  },

  removeCard: (id: string) => {
    useAdminStore.setState((s) => ({
      flashcards: s.flashcards.filter(c => c.id !== id),
    }));
  },

  setError: (error: string) => {
    useAdminStore.setState({ error, isSaving: false, isLoadingCards: false, isLoadingUsers: false });
  },

  clearFeedback: () => {
    useAdminStore.setState({ error: null, successMessage: null });
  },
};
