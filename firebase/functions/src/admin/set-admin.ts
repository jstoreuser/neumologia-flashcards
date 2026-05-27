/**
 * setAdminRole — Callable Cloud Function (Admin only)
 *
 * Sets or revokes the 'admin' custom claim on a Firebase Auth user.
 *
 * SECURITY:
 * - Caller must be authenticated
 * - Caller must already have the 'admin' custom claim
 * - Admin cannot revoke their own admin status
 *
 * Usage (client-side):
 *   const setAdmin = httpsCallable(functions, 'setAdminRole');
 *   await setAdmin({ uid: 'target-user-uid', isAdmin: true });
 */

import { https, logger } from 'firebase-functions/v2';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

interface SetAdminRequest {
  uid: string;
  isAdmin: boolean;
}

export const setAdminRole = https.onCall<SetAdminRequest>(async (request) => {
  // 1. Verify caller is authenticated
  if (!request.auth) {
    throw new https.HttpsError(
      'unauthenticated',
      'You must be signed in to call this function.'
    );
  }

  // 2. Verify caller has admin claim
  const callerIsAdmin = request.auth.token?.admin === true;
  if (!callerIsAdmin) {
    throw new https.HttpsError(
      'permission-denied',
      'Only admins can grant or revoke admin roles.'
    );
  }

  const { uid, isAdmin } = request.data;

  // 3. Validate input
  if (!uid || typeof uid !== 'string') {
    throw new https.HttpsError('invalid-argument', 'uid must be a non-empty string.');
  }

  // 4. Prevent self-revocation
  if (uid === request.auth.uid && !isAdmin) {
    throw new https.HttpsError(
      'failed-precondition',
      'You cannot revoke your own admin status.'
    );
  }

  try {
    const auth = getAuth();
    const db = getFirestore();

    // Set/revoke custom claim
    await auth.setCustomUserClaims(uid, { admin: isAdmin });

    // Also update the Firestore user doc role for display purposes only.
    // This field is NOT used for authorization — the custom claim is.
    await db.collection('users').doc(uid).update({
      role: isAdmin ? 'admin' : 'student',
    });

    logger.info(`Admin role ${isAdmin ? 'granted' : 'revoked'} for uid: ${uid}`, {
      callerUid: request.auth.uid,
      targetUid: uid,
    });

    return { success: true };
  } catch (err) {
    logger.error('setAdminRole failed', err);
    throw new https.HttpsError('internal', 'Failed to update user role.');
  }
});
