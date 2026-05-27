/**
 * Centralized Toast Service
 * 
 * Simple pub/sub system for showing UI feedback.
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

type ToastListener = (toast: ToastMessage) => void;

class ToastService {
  private listeners: Set<ToastListener> = new Set();

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  show(type: ToastType, message: string) {
    const toast: ToastMessage = { id: crypto.randomUUID(), type, message };
    this.listeners.forEach(l => l(toast));
  }

  success(message: string) { this.show('success', message); }
  error(message: string) { this.show('error', message); }
  warning(message: string) { this.show('warning', message); }
  info(message: string) { this.show('info', message); }
}

export const toast = new ToastService();
