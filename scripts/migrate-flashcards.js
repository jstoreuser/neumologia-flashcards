import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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

async function migrate() {
    console.log('Starting Firestore migration...');
    const snapshot = await db.collection('flashcards').get();
    
    let batch = db.batch();
    let count = 0;
    
    for (const doc of snapshot.docs) {
        const data = doc.data();
        
        if (data.authorId === 'seed-script') {
            batch.delete(doc.ref);
            count++;
            
            if (count % 400 === 0) {
                await batch.commit();
                batch = db.batch();
            }
            continue;
        }

        // Convert 'published' -> 'isPublished', 'deleted' -> 'isDeleted'
        // Add required fields 'category' and 'authorId' if missing
        const updateData = {};
        
        if (data.published !== undefined && data.isPublished === undefined) {
            updateData.isPublished = data.published;
        } else if (data.isPublished === undefined) {
            updateData.isPublished = true;
        }

        if (data.deleted !== undefined && data.isDeleted === undefined) {
            updateData.isDeleted = data.deleted;
        } else if (data.isDeleted === undefined) {
            updateData.isDeleted = false;
        }
        
        if (data.category === undefined) {
            updateData.category = 'General';
        }
        
        if (data.authorId === undefined) {
            updateData.authorId = 'system';
        }
        
        // Map integer difficulty to enum if needed
        if (typeof data.difficulty === 'number') {
            if (data.difficulty === 1) updateData.difficulty = 'easy';
            else if (data.difficulty === 2) updateData.difficulty = 'medium';
            else updateData.difficulty = 'hard';
        }

        if (Object.keys(updateData).length > 0) {
            batch.update(doc.ref, updateData);
            count++;
            
            if (count % 400 === 0) {
                await batch.commit();
                batch = db.batch();
            }
        }
    }
    
    if (count % 400 !== 0) {
        await batch.commit();
    }
    
    console.log(`Migration complete. Updated ${count} documents.`);
}

migrate().catch(console.error);
