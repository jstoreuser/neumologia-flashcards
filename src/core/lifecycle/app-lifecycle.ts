/**
 * Application Lifecycle — functional module.
 *
 * Follows the same closure-based philosophy as createStore<T>.
 * No classes. No OOP boilerplate. Predictable boot/teardown sequence.
 *
 * Usage:
 *   const lifecycle = createAppLifecycle(deps);
 *   await lifecycle.boot();
 *   // on unload:
 *   lifecycle.teardown();
 */

import { auth, db } from '@/core/services/firebase';
import { telemetry } from '@/core/services/telemetry';
import { onAuthStateChanged, User } from 'firebase/auth';

type CleanupFn = () => void;

export interface AppLifecycle {
  boot: () => Promise<void>;
  teardown: () => void;
  registerCleanup: (fn: CleanupFn) => void;
}

export interface AppLifecycleDeps {
  /** Called when auth resolves to a valid, email-verified user. */
  onReady: (user: User) => Promise<void>;
  /** Called when user is null or not verified → redirect to login. */
  onUnauthenticated: () => void;
}

export function createAppLifecycle(deps: AppLifecycleDeps): AppLifecycle {
  const cleanupFns: CleanupFn[] = [];
  let booted = false;

  const registerCleanup = (fn: CleanupFn): void => {
    cleanupFns.push(fn);
  };

  const boot = (): Promise<void> => {
    if (booted) return Promise.resolve();
    booted = true;

    // Phase 1: Global error capture
    telemetry.init();

    return new Promise((resolve, reject) => {
      // Phase 2: Wait for Firebase Auth to settle (resolves once on boot)
      const unsubscribeAuth = onAuthStateChanged(
        auth,
        async (user) => {
          // Unsubscribe immediately — we only need the initial state.
          // Ongoing session changes are handled at the feature level.
          unsubscribeAuth();

          try {
            if (!user) {
              deps.onUnauthenticated();
              resolve();
              return;
            }

            // Phase 3: App is ready — hand off to feature orchestrator
            await deps.onReady(user);
            resolve();
          } catch (err) {
            telemetry.captureError(err, { phase: 'boot' });
            reject(err);
          }
        },
        (err) => {
          telemetry.captureError(err, { phase: 'auth_state' });
          reject(err);
        },
      );

      registerCleanup(unsubscribeAuth);
    });
  };

  const teardown = (): void => {
    for (const fn of cleanupFns) {
      try {
        fn();
      } catch (err) {
        // Log but never throw during teardown — cleanup must be bulletproof
        telemetry.captureError(err, { phase: 'teardown' });
      }
    }
    cleanupFns.length = 0;
    booted = false;
  };

  return { boot, teardown, registerCleanup };
}
