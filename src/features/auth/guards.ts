/**
 * Route Guards
 *
 * Pure functions that check auth state and redirect if needed.
 * Email verification is NOT required — users login directly after registration.
 */

import { auth } from '@/core/services/firebase';
import { getIsAdmin } from './auth.service';

/**
 * Ensures the user is authenticated.
 * Redirects to login.html if not.
 */
export async function requireAuth(): Promise<import('firebase/auth').User> {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();

      if (!user) {
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

      if (user) {
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
