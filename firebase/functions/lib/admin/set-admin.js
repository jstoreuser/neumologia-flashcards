"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAdminRole = void 0;
const v2_1 = require("firebase-functions/v2");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
exports.setAdminRole = v2_1.https.onCall(async (request) => {
    // 1. Verify caller is authenticated
    if (!request.auth) {
        throw new v2_1.https.HttpsError('unauthenticated', 'You must be signed in to call this function.');
    }
    // 2. Verify caller has admin claim
    const callerIsAdmin = request.auth.token?.admin === true;
    if (!callerIsAdmin) {
        throw new v2_1.https.HttpsError('permission-denied', 'Only admins can grant or revoke admin roles.');
    }
    const { uid, isAdmin } = request.data;
    // 3. Validate input
    if (!uid || typeof uid !== 'string') {
        throw new v2_1.https.HttpsError('invalid-argument', 'uid must be a non-empty string.');
    }
    // 4. Prevent self-revocation
    if (uid === request.auth.uid && !isAdmin) {
        throw new v2_1.https.HttpsError('failed-precondition', 'You cannot revoke your own admin status.');
    }
    try {
        const auth = (0, auth_1.getAuth)();
        const db = (0, firestore_1.getFirestore)();
        // Set/revoke custom claim
        await auth.setCustomUserClaims(uid, { admin: isAdmin });
        // Also update the Firestore user doc role for display purposes only.
        // This field is NOT used for authorization — the custom claim is.
        await db.collection('users').doc(uid).update({
            role: isAdmin ? 'admin' : 'student',
        });
        v2_1.logger.info(`Admin role ${isAdmin ? 'granted' : 'revoked'} for uid: ${uid}`, {
            callerUid: request.auth.uid,
            targetUid: uid,
        });
        return { success: true };
    }
    catch (err) {
        v2_1.logger.error('setAdminRole failed', err);
        throw new v2_1.https.HttpsError('internal', 'Failed to update user role.');
    }
});
