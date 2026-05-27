export type Listener<T> = (state: T) => void;

export interface Store<T> {
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean) => void;
  subscribe: (listener: Listener<T>) => () => void;
}

/**
 * Lightweight, Zustand-like state manager for Vanilla JS/TS.
 */
export function createStore<T>(initialState: T): Store<T> {
  let state = initialState;
  const listeners = new Set<Listener<T>>();

  const getState = () => state;

  const setState = (
    partial: Partial<T> | ((state: T) => Partial<T>),
    replace: boolean = false
  ) => {
    const nextState = typeof partial === 'function' ? (partial as any)(state) : partial;

    if (nextState !== state) {
      state = replace ? (nextState as T) : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state));
    }
  };

  const subscribe = (listener: Listener<T>) => {
    listeners.add(listener);
    return () => listeners.delete(listener); // Returns cleanup function
  };

  return { getState, setState, subscribe };
}
