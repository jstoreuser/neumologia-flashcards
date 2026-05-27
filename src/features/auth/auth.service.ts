/**
 * Auth Service
 *
 * Single point of truth for all Firebase Auth operations.
 * Follows the same functional/closure philosophy as the rest of the codebase.
 *
 * Responsibilities:
 * - Login, registration, logout, email verification
 * - Observing auth state changes
 * - Reading custom claims (admin role)
 * - Creating Firestore user profile on first login
 */

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  reload,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/core/services/firebase';
import { AuthError, NetworkError } from '@/core/errors';
import type { UserProfile } from '@shared/contracts';

export interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
}

// ── Login ────────────────────────────────────────────────────────────────────

export async function loginWithEmail(email: string, password: string): Promise<User> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch {
    // Intentionally generic — prevents user enumeration attacks
    throw new AuthError('Credenciales inválidas.');
  }
}

// ── Register ─────────────────────────────────────────────────────────────────

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<User> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;

    // Send verification email immediately after registration
    await sendEmailVerification(user);

    // Create the Firestore profile with role locked to 'student'
    await createUserProfile(user, displayName);

    return user;
  } catch (err) {
    console.error('[Registration Error]', err);
    if (err instanceof AuthError) throw err;
    throw new AuthError('No se pudo registrar la cuenta. Verifica tus datos o intenta con otro correo.');
  }
}

// ── Logout ───────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch {
    throw new NetworkError('Logout failed — check your connection');
  }
}

// ── Email Verification ───────────────────────────────────────────────────────

export async function resendVerificationEmail(user: User): Promise<void> {
  try {
    await sendEmailVerification(user);
  } catch {
    throw new NetworkError('Could not send verification email');
  }
}

export async function refreshEmailVerification(user: User): Promise<boolean> {
  try {
    await reload(user);
    return user.emailVerified;
  } catch {
    throw new NetworkError('Could not refresh auth state');
  }
}

// ── User Profile ─────────────────────────────────────────────────────────────

/**
 * Creates the Firestore user profile document on first login.
 * Idempotent: uses { merge: false } to avoid overwriting existing profiles.
 * On subsequent logins the document already exists and this is a no-op.
 */
export async function createUserProfile(user: User, displayName?: string): Promise<void> {
  const ref = doc(db, 'users', user.uid);

  // Check if profile already exists to preserve any existing data
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return;

  const profile: Omit<UserProfile, 'uid'> & { uid: string } = {
    uid: user.uid,
    email: user.email ?? '',
    displayName: displayName ?? user.displayName ?? null,
    role: 'student',
    preferences: { theme: 'dark', dailyGoal: 30 },
    createdAt: serverTimestamp(),
  };

  await setDoc(ref, profile);
}

/**
 * Fetches the user profile from Firestore.
 * Returns null if the profile does not exist (e.g., auth user created outside the app).
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, 'users', uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return snapshot.data() as UserProfile;
}

// ── Admin Claims ─────────────────────────────────────────────────────────────

/**
 * Reads admin status from the ID token custom claims.
 * Always uses the token — never a Firestore field — for authorization.
 */
export async function getIsAdmin(user: User): Promise<boolean> {
  const tokenResult = await user.getIdTokenResult(/* forceRefresh */ false);
  return tokenResult.claims['admin'] === true;
}

// ── Auth State Observer ──────────────────────────────────────────────────────

/**
 * Returns a cleanup function that unsubscribes the observer.
 * The callback receives null when the user signs out.
 */
export function observeAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
