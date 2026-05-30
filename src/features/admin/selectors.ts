/**
 * Selectors for Admin Store
 *
 * Provides memoized pure functions to derive UI state from the normalized server state.
 */

import type { AdminState, CardSortField, SortDir } from './store';
import type { Flashcard, UserProfile } from '@shared/contracts';

// ---------------------------------------------------------------------------
// Minimal 1-input and 2-input createSelector helpers (fully typed, no deps)
// ---------------------------------------------------------------------------

function createSelector<S, R1, Result>(
  input1: (state: S) => R1,
  combiner: (r1: R1) => Result
): (state: S) => Result;

function createSelector<S, R1, R2, Result>(
  input1: (state: S) => R1,
  input2: (state: S) => R2,
  combiner: (r1: R1, r2: R2) => Result
): (state: S) => Result;

function createSelector<S, R1, R2, R3, Result>(
  input1: (state: S) => R1,
  input2: (state: S) => R2,
  input3: (state: S) => R3,
  combiner: (r1: R1, r2: R2, r3: R3) => Result
): (state: S) => Result;

function createSelector<S>(...args: any[]): (state: S) => any {
  if (args.length === 2) {
    const [input1, combiner] = args;
    let lastR1: any;
    let lastResult: any;
    return (state: S) => {
      const r1 = input1(state);
      if (r1 !== lastR1 || lastResult === undefined) {
        lastResult = combiner(r1);
        lastR1 = r1;
      }
      return lastResult;
    };
  }

  if (args.length === 3) {
    // 3-arg (2 inputs + combiner)
    const [input1, input2, combiner] = args;
    let lastR1: any, lastR2: any, lastResult: any;
    return (state: S) => {
      const r1 = input1(state);
      const r2 = input2(state);
      if (r1 !== lastR1 || r2 !== lastR2 || lastResult === undefined) {
        lastResult = combiner(r1, r2);
        lastR1 = r1;
        lastR2 = r2;
      }
      return lastResult;
    };
  }

  // 4-arg (3 inputs + combiner)
  const [input1, input2, input3, combiner] = args;
  let lastR1: any, lastR2: any, lastR3: any, lastResult: any;
  return (state: S) => {
    const r1 = input1(state);
    const r2 = input2(state);
    const r3 = input3(state);
    if (r1 !== lastR1 || r2 !== lastR2 || r3 !== lastR3 || lastResult === undefined) {
      lastResult = combiner(r1, r2, r3);
      lastR1 = r1;
      lastR2 = r2;
      lastR3 = r3;
    }
    return lastResult;
  };
}

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

function sortFlashcards(list: Flashcard[], field: CardSortField, dir: SortDir): Flashcard[] {
  const mul = dir === 'asc' ? 1 : -1;
  return [...list].sort((a, b) => {
    if (field === 'id') {
      const na = parseInt(a.id ?? '', 10);
      const nb = parseInt(b.id ?? '', 10);
      if (!isNaN(na) && !isNaN(nb)) return mul * (na - nb);
      return mul * (a.id ?? '').localeCompare(b.id ?? '');
    }
    if (field === 'category') {
      return mul * (a.category ?? '').localeCompare(b.category ?? '');
    }
    // createdAt
    const ta = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
    const tb = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
    return mul * (ta - tb);
  });
}

export const selectFlashcardsList = createSelector(
  (state: AdminState) => state.flashcards.allIds,
  (state: AdminState) => state.flashcards.byId,
  (state: AdminState) => ({ field: state.cardSortField, dir: state.cardSortDir }),
  (allIds: string[], byId: Record<string, Flashcard>, sort: { field: CardSortField; dir: SortDir }) => {
    const list = allIds
      .map(id => byId[id])
      .filter((c): c is Flashcard => c !== undefined);
    return sortFlashcards(list, sort.field, sort.dir);
  }
);

export const selectPublishedFlashcards = createSelector(
  selectFlashcardsList,
  (list: Flashcard[]) => list.filter(c => c.isPublished && !c.isDeleted)
);

export const selectUsersList = createSelector(
  (state: AdminState) => state.users.allIds,
  (state: AdminState) => state.users.byId,
  (allIds: string[], byId: Record<string, UserProfile>) =>
    allIds.map(id => byId[id]).filter((u): u is UserProfile => u !== undefined)
);

export const selectHasPendingOperation = (state: AdminState, entityId: string, type?: string) => {
  return Object.values(state.pendingOperations).some(
    op => op.entityId === entityId && (!type || op.type === type)
  );
};
