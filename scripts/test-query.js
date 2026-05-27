import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { z } from 'zod';
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

const TimestampLike = z.union([
  z.date(),
  z.string().datetime({ offset: true }),
  z.object({ toDate: z.function().returns(z.date()) }),
]);

const FlashcardSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1, 'La pregunta es obligatoria'),
  answer: z.string().min(1, 'La respuesta es obligatoria'),
  explanation: z.string().default(''),
  imageUrl: z.string().optional().nullable(),
  specialty: z.string().min(1).default('neumologia'),
  category: z.string().min(1, 'Categoría es obligatoria'),
  subcategory: z.string().default(''),
  tags: z.array(z.string()).default([]),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  order: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
  schemaVersion: z.number().int().min(1).default(1),
  createdAt: TimestampLike,
  updatedAt: TimestampLike.optional(),
  authorId: z.string().min(1),
});

async function testQuery() {
    try {
        console.log("Testing query...");
        const snapshot = await db.collection('flashcards')
            .where('isPublished', '==', true)
            .where('isDeleted', '==', false)
            .limit(20)
            .get();
        
        console.log(`Found ${snapshot.docs.length} docs.`);
        
        if (snapshot.docs.length > 0) {
            console.log("Testing Zod parsing on first doc...");
            const doc = snapshot.docs[0];
            const data = doc.data();
            const parsed = FlashcardSchema.safeParse({ id: doc.id, ...data });
            if (!parsed.success) {
                console.error("ZOD ERROR:", parsed.error.format());
            } else {
                console.log("Zod parse SUCCESS!");
            }
        }
    } catch (err) {
        console.error("QUERY ERROR:", err);
    }
}

testQuery();
