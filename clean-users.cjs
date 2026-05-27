const fs = require('fs');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Use the local ADC or a service account to authenticate
initializeApp();

const db = getFirestore();

async function cleanOrphanedUsers() {
  try {
    const authUsersFile = fs.readFileSync('auth_users.json', 'utf8');
    const authUsers = JSON.parse(authUsersFile).users || [];
    
    // Create a Set of valid UIDs from Firebase Auth
    const validUids = new Set(authUsers.map(u => u.localId));
    console.log(`Found ${validUids.size} valid users in Auth.`);

    // Fetch all documents in the "users" collection
    const usersSnapshot = await db.collection('users').get();
    console.log(`Found ${usersSnapshot.size} user profiles in Firestore.`);

    let deletedCount = 0;
    const batch = db.batch();

    for (const doc of usersSnapshot.docs) {
      if (!validUids.has(doc.id)) {
        console.log(`Deleting orphaned profile: ${doc.id} (Email: ${doc.data().email})`);
        batch.delete(doc.ref);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      await batch.commit();
      console.log(`\nSuccessfully deleted ${deletedCount} orphaned user profiles.`);
    } else {
      console.log('\nNo orphaned user profiles found.');
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

cleanOrphanedUsers();
