/**
 * Route Guards
 *
 * Pure functions that check auth state and redirect if needed.
 * Called at the top of each page's entry point (main.ts, admin.main.ts).
 *
 * Design: synchronous redirect pattern — call guard, if it redirects
 * execution stops, otherwise continue booting.
 */

import { auth } from '@/core/services/firebase';
import { getIsAdmin } from './auth.service';

/**
 * Ensures the user is authenticated and email-verified.
 * Redirects to login.html if not.
 * Returns the current user if authenticated.
 */
export async function requireAuth(): Promise<import('firebase/auth').User> {
  return new Promise((resolve) => {
    // onAuthStateChanged fires once immediately with current state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();

      if (!user || !user.emailVerified) {
        window.location.replace('/login.html');
        return;
      }

      resolve(user);
    });
  });
}

/**
 * Ensures the user is an admin (via custom claim).
 * Redirects to index.html if not.
 */
export async function requireAdmin(): Promise<import('firebase/auth').User> {
  const user = await requireAuth();
  const isAdmin = await getIsAdmin(user);

  if (!isAdmin) {
    window.location.replace('/index.html');
    // Return a never-resolving promise to halt execution
    return new Promise(() => undefined);
  }

  return user;
}

/**
 * Redirects already-authenticated users away from the login page.
 * Call this at the top of login.main.ts.
 */
export function redirectIfAuthenticated(): Promise<void> {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();

      if (user?.emailVerified) {
        try {
          const idToken = await user.getIdTokenResult();
          if (idToken.claims.admin) {
            window.location.replace('/admin.html');
          } else {
            window.location.replace('/index.html');
          }
        } catch {
          window.location.replace('/index.html');
        }
        return;
      }

      resolve();
    });
  });
}
