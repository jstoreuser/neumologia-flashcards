import { describe, it, expect, vi } from 'vitest';
import { createStore } from './index';

interface TestState {
  count: number;
  label: string;
}
const initial: TestState = { count: 0, label: 'a' };

describe('createStore — state access', () => {
  it('returns the initial state', () => {
    const store = createStore<TestState>(initial);
    expect(store.getState()).toEqual({ count: 0, label: 'a' });
  });

  it('shallow-merges a partial update', () => {
    const store = createStore<TestState>(initial);
    store.setState({ count: 5 });
    expect(store.getState()).toEqual({ count: 5, label: 'a' });
  });

  it('supports a functional updater receiving current state', () => {
    const store = createStore<TestState>(initial);
    store.setState({ count: 2 });
    store.setState((s) => ({ count: s.count + 10 }));
    expect(store.getState().count).toBe(12);
    expect(store.getState().label).toBe('a');
  });

  it('replaces the whole state when replace=true', () => {
    const store = createStore<TestState>(initial);
    store.setState({ count: 99, label: 'z' } as TestState, true);
    expect(store.getState()).toEqual({ count: 99, label: 'z' });
  });
});

describe('createStore — subscriptions', () => {
  it('notifies subscribers with the new state on change', () => {
    const store = createStore<TestState>(initial);
    const listener = vi.fn();
    store.subscribe(listener);
    store.setState({ count: 1 });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith({ count: 1, label: 'a' });
  });

  it('stops notifying after unsubscribe', () => {
    const store = createStore<TestState>(initial);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.setState({ count: 1 });
    unsubscribe();
    store.setState({ count: 2 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('supports multiple independent subscribers', () => {
    const store = createStore<TestState>(initial);
    const a = vi.fn();
    const b = vi.fn();
    store.subscribe(a);
    store.subscribe(b);
    store.setState({ label: 'b' });
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });
});
