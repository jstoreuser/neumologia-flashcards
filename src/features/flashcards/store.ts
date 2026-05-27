import { Flashcard } from '@shared/contracts';
import { createStore } from '@/core/store';

export interface FlashcardsState {
  cards: Flashcard[];
  currentIndex: number;
  isLoading: boolean;
  activeFilter: string | null;
  error: string | null;
  hasMore: boolean;
}

const initialState: FlashcardsState = {
  cards: [],
  currentIndex: 0,
  isLoading: false,
  activeFilter: 'Todos',
  error: null,
  hasMore: true,
};

export const useFlashcardStore = createStore<FlashcardsState>(initialState);

// Actions
export const flashcardActions = {
  setLoading: (isLoading: boolean) => {
    useFlashcardStore.setState({ isLoading });
  },
  
  setCards: (cards: Flashcard[], hasMore: boolean) => {
    useFlashcardStore.setState({ cards, hasMore, error: null });
  },
  
  appendCards: (newCards: Flashcard[], hasMore: boolean) => {
    useFlashcardStore.setState((state) => ({
      cards: [...state.cards, ...newCards],
      hasMore,
    }));
  },

  nextCard: () => {
    useFlashcardStore.setState((state) => {
      if (state.currentIndex < state.cards.length - 1) {
        return { currentIndex: state.currentIndex + 1 };
      }
      return {}; // No change if at the end
    });
  },

  setFilter: (filter: string) => {
    useFlashcardStore.setState({ activeFilter: filter, currentIndex: 0, cards: [] });
  },

  setError: (error: string) => {
    useFlashcardStore.setState({ error, isLoading: false });
  }
};
