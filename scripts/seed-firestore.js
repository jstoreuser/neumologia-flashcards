import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'barcl-6e65e'
});

const db = getFirestore();

// Maps a legacy difficulty number or string to the schema enum
function normalizeDifficulty(raw) {
    if (typeof raw === 'string' && ['easy', 'medium', 'hard'].includes(raw)) return raw;
    if (raw === 1) return 'easy';
    if (raw === 2) return 'medium';
    if (raw === 3) return 'hard';
    return 'medium';
}

async function seedFirestore() {
    console.log('=== INICIANDO SEED DO FIRESTORE ===');

    // Reads from the canonical source — src/data/formatted_texts.json
    const dataPath = path.resolve(__dirname, '../src/data/formatted_texts.json');

    if (!fs.existsSync(dataPath)) {
        console.error(`ERRO: Arquivo não encontrado: ${dataPath}`);
        process.exit(1);
    }

    let flashcards;
    try {
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        flashcards = JSON.parse(rawData);
    } catch (err) {
        console.error('Erro ao ler/parsear JSON:', err.message);
        process.exit(1);
    }

    if (!Array.isArray(flashcards)) {
        if (typeof flashcards === 'object' && flashcards !== null) {
            flashcards = Object.values(flashcards);
        } else {
            console.error('ERRO: O JSON não é um array nem um objeto válido.');
            process.exit(1);
        }
    }

    console.log(`Lidos ${flashcards.length} flashcards. Iniciando migração...`);

    // Batch size must stay below Firestore's 500-operation limit.
    // 400 gives a safe margin for any set() + update() combos.
    const BATCH_SIZE = 400;
    let batch = db.batch();
    let batchCount = 0;
    let totalCount = 0;

    for (let i = 0; i < flashcards.length; i++) {
        const card = flashcards[i];

        const specialty = card.specialty || 'neumologia';
        const deterministicId = card.id
            ? String(card.id)
            : `${specialty.toLowerCase().replace(/\s+/g, '-')}_${i.toString().padStart(4, '0')}`;

        const cardRef = db.collection('flashcards').doc(deterministicId);

        const docData = {
            question: card.prompt || card.question || '',
            answer: card.answer || '',
            explanation: card.explanation || '',
            imageUrl: (card.images && card.images[0]) || card.imageUrl || null,
            specialty: specialty,
            category: card.category || 'General',
            subcategory: card.subcategory || '',
            tags: Array.isArray(card.tags) ? card.tags : [],
            difficulty: normalizeDifficulty(card.difficulty),
            order: i,
            isPublished: card.isPublished === true,
            isDeleted: false,
            schemaVersion: 1,
            authorId: 'seed-script',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        };

        batch.set(cardRef, docData, { merge: true });
        batchCount++;
        totalCount++;

        // Commit and reset the batch before hitting the limit
        if (batchCount === BATCH_SIZE) {
            await batch.commit();
            console.log(`Batch gravado (${totalCount} cards processados)`);
            batch = db.batch();
            batchCount = 0;
        }
    }

    // Commit any remaining documents in the last partial batch
    if (batchCount > 0) {
        await batch.commit();
    }

    console.log(`=== SEED CONCLUÍDO COM SUCESSO (${totalCount} flashcards) ===`);
}

seedFirestore().catch((err) => {
    console.error('Seed falhou:', err);
    process.exit(1);
});


