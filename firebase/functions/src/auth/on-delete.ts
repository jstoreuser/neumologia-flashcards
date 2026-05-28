import * as functions from 'firebase-functions/v1';
import { getFirestore } from 'firebase-admin/firestore';

export const deleteUserProfile = functions.auth.user().onDelete(async (user) => {
  const db = getFirestore();
  const ref = db.collection('users').doc(user.uid);

  // recursiveDelete removes the user document AND its subcollections
  // (e.g. progress/*), which Firestore does not cascade automatically.
  // Prevents orphaned study-progress data lingering for deleted users.
  await db.recursiveDelete(ref);
  console.log(`Deleted user profile and subcollections for UID: ${user.uid}`);
});
