import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'barcl-6e65e'
});

const db = getFirestore();

// DRY_RUN mode: Set to false to actually commit the changes
const DRY_RUN = process.argv.includes('--dry-run');

async function migrate() {
    console.log(`Starting Firestore migration (DRY_RUN=${DRY_RUN})...`);
    
    let batch = db.batch();
    let count = 0;

    // 1. Migrate Flashcards
    console.log('Fetching flashcards...');
    const flashcardsSnap = await db.collection('flashcards').get();
    console.log(`Found ${flashcardsSnap.size} flashcards.`);

    for (const doc of flashcardsSnap.docs) {
        const data = doc.data();
        const updateData = {};

        if (data.migrationVersion === undefined || data.migrationVersion < 1) {
            updateData.migrationVersion = 1;
        }

        if (data.schemaVersion === undefined) {
            updateData.schemaVersion = 1;
        }

        if (data.createdAt === undefined) {
            updateData.createdAt = FieldValue.serverTimestamp();
        }

        if (data.updatedAt === undefined) {
            updateData.updatedAt = FieldValue.serverTimestamp();
        }

        if (data.order === undefined) {
            updateData.order = 0;
        }

        if (Object.keys(updateData).length > 0) {
            if (!DRY_RUN) {
                batch.update(doc.ref, updateData);
            }
            console.log(`[Flashcard] ${doc.id} requires updates:`, Object.keys(updateData));
            count++;
            
            if (!DRY_RUN && count % 400 === 0) {
                await batch.commit();
                batch = db.batch();
                console.log(`Committed ${count} updates...`);
            }
        }
    }

    // 2. Migrate Users (optional, to ensure createdAt exists and is valid)
    console.log('Fetching users...');
    const usersSnap = await db.collection('users').get();
    console.log(`Found ${usersSnap.size} users.`);

    for (const doc of usersSnap.docs) {
        const data = doc.data();
        const updateData = {};

        if (data.migrationVersion === undefined || data.migrationVersion < 1) {
            updateData.migrationVersion = 1;
        }

        if (data.createdAt === undefined) {
            updateData.createdAt = FieldValue.serverTimestamp();
        }

        if (Object.keys(updateData).length > 0) {
            if (!DRY_RUN) {
                batch.update(doc.ref, updateData);
            }
            console.log(`[User] ${doc.id} requires updates:`, Object.keys(updateData));
            count++;
            
            if (!DRY_RUN && count % 400 === 0) {
                await batch.commit();
                batch = db.batch();
                console.log(`Committed ${count} updates...`);
            }
        }
    }

    if (!DRY_RUN && count % 400 !== 0) {
        await batch.commit();
    }
    
    console.log(`Migration complete. Processed ${count} pending document updates.`);
}

migrate().catch(console.error);
