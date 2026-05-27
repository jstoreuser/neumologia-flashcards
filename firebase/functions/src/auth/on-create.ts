/**
 * onUserCreate — Firebase Auth trigger
 *
 * Fires when a new user is created (e.g., email/password or Google Sign-In).
 * Creates a Firestore user profile document with role: 'student'.
 *
 * This ensures the profile always exists, even if the client-side
 * createUserProfile() call fails (network error, crash, etc.).
 * The Firestore rule only allows creating with role: 'student',
 * so this server-side creation is the authoritative fallback.
 *
 * The client-side createUserProfile() is still kept (idempotent via
 * existence check), but this function is the safety net.
 */

import * as functions from 'firebase-functions/v1';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp();

export const createUserProfile = functions.auth.user().onCreate(async (user) => {
  const db = getFirestore();
  const ref = db.collection('users').doc(user.uid);
  const snapshot = await ref.get();

  // Idempotent: only create if profile doesn't already exist
  if (snapshot.exists) return;

  await ref.set({
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? null,
    role: 'student',
    preferences: { theme: 'dark', dailyGoal: 30 },
    createdAt: FieldValue.serverTimestamp(),
    lastLoginAt: FieldValue.serverTimestamp(),
  });
});


