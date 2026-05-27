import { ReactiveController, ReactiveControllerHost } from 'lit';
import type { Store, Listener } from '@/core/store';

/**
 * Connects a Lit component to a Zustand-like Store.
 * 
 * - Automatically subscribes on `hostConnected` (component mounted)
 * - Automatically unsubscribes on `hostDisconnected` (component unmounted)
 * - Triggers `requestUpdate()` on every state change → Lit re-renders
 * 
 * Usage:
 * ```ts
 * class MyComponent extends LitElement {
 *   private store = new StoreController(this, useFlashcardStore);
 *   render() {
 *     const { cards } = this.store.value;
 *     return html`...`;
 *   }
 * }
 * ```
 */
export class StoreController<T> implements ReactiveController {
  private _unsubscribe: (() => void) | undefined = undefined;
  value: T;

  constructor(
    private host: ReactiveControllerHost,
    private store: Store<T>,
  ) {
    this.host.addController(this);
    this.value = store.getState();
  }

  hostConnected(): void {
    this._unsubscribe = this.store.subscribe((state) => {
      this.value = state;
      this.host.requestUpdate();
    });
  }

  hostDisconnected(): void {
    this._unsubscribe?.();
    this._unsubscribe = undefined;
  }
}

/**
 * Connects a Lit component to a specific slice of a Store.
 * Only triggers re-render when the selected slice changes.
 * 
 * Usage:
 * ```ts
 * class MyComponent extends LitElement {
 *   private cards = new StoreSliceController(this, useFlashcardStore, s => s.cards);
 *   render() {
 *     return html`${this.cards.value.length} cards`;
 *   }
 * }
 * ```
 */
export class StoreSliceController<T, S> implements ReactiveController {
  private _unsubscribe: (() => void) | undefined = undefined;
  value: S;

  constructor(
    private host: ReactiveControllerHost,
    private store: Store<T>,
    private selector: (state: T) => S,
  ) {
    this.host.addController(this);
    this.value = selector(store.getState());
  }

  hostConnected(): void {
    this._unsubscribe = this.store.subscribe((state) => {
      const next = this.selector(state);
      if (next !== this.value) {
        this.value = next;
        this.host.requestUpdate();
      }
    });
  }

  hostDisconnected(): void {
    this._unsubscribe?.();
    this._unsubscribe = undefined;
  }
}
