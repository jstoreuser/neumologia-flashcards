// Global events only!
type GlobalEvents = {
  'auth_changed': { uid: string | null; role: string | null };
  'toast': { message: string; type: 'success' | 'error' | 'info' };
  'theme_changed': { theme: 'light' | 'dark' };
  'network_status': { isOnline: boolean };
};

type EventName = keyof GlobalEvents;
type EventCallback<K extends EventName> = (payload: GlobalEvents[K]) => void;

class EventBus {
  private listeners: Map<EventName, Set<EventCallback<any>>> = new Map();

  on<K extends EventName>(event: K, callback: EventCallback<K>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return cleanup function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  emit<K extends EventName>(event: K, payload: GlobalEvents[K]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb(payload));
    }
  }
}

export const globalEvents = new EventBus();
