import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  reload,
  type User,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/core/services/firebase';
import { AuthError, NetworkError } from '@/core/errors';
import type { UserProfile } from '@shared/contracts';

// ── Login ─────────────────────────────────────────────────────────────────────

export async function loginWithEmail(email: string, password: string): Promise<User> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch {
    // Intentionally generic — prevents user enumeration attacks
    throw new AuthError('Credenciais inválidas. Verifique e-mail e senha.');
  }
}

// ── Register ──────────────────────────────────────────────────────────────────

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<User> {
  // Step 1: Create the Firebase Auth account.
  // This is the only step that can fail with "email already in use".
  let user: User;
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    user = credential.user;
  } catch (err: any) {
    if (err?.code === 'auth/email-already-in-use') {
      throw new AuthError('Este e-mail já está cadastrado. Tente fazer login.');
    }
    if (err?.code === 'auth/weak-password') {
      throw new AuthError('Senha muito fraca. Use no mínimo 6 caracteres.');
    }
    throw new AuthError('Não foi possível criar a conta. Tente novamente.');
  }

  // Step 2: Create the Firestore profile.
  // If this fails, the auth account already exists — user can just login.
  try {
    await createUserProfile(user, displayName);
  } catch (err) {
    console.warn('[Auth] Profile creation failed after account was created:', err);
    // Non-fatal: profile will be created on first login via createUserProfile
  }

  return user;
}

// ── Logout ────────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch {
    throw new NetworkError('Logout falhou — verifique sua conexão.');
  }
}

// ── User Profile ──────────────────────────────────────────────────────────────

/**
 * Creates the Firestore user profile document on first login.
 * Idempotent: returns early if the profile already exists.
 */
export async function createUserProfile(user: User, displayName?: string): Promise<void> {
  const ref = doc(db, 'users', user.uid);

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
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, 'users', uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return snapshot.data() as UserProfile;
}

// ── Admin Claims ──────────────────────────────────────────────────────────────

/**
 * Reads admin status from the ID token custom claims.
 * Always uses the token — never a Firestore field — for authorization.
 */
export async function getIsAdmin(user: User): Promise<boolean> {
  const tokenResult = await user.getIdTokenResult(/* forceRefresh */ false);
  return tokenResult.claims['admin'] === true;
}

// ── Auth State Observer ───────────────────────────────────────────────────────

/**
 * Returns a cleanup function that unsubscribes the observer.
 */
export function observeAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
