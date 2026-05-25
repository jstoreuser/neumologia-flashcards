import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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

// Carrega os dados antigos (Se existir um data.json exportado ou simulamos)
async function seedFirestore() {
    console.log("=== INICIANDO SEED DO FIRESTORE ===");
    
    // Tenta ler o data.js antigo ou um JSON. 
    // Como o app.js tinha FLASHCARD_DATA nativamente no escopo da window, 
    // precisaremos extrair de lá ou do src/js/data.js
    
    // Simulando a leitura de um arquivo hipotético de dados exportados
    const dataPath = path.resolve(__dirname, '../src/js/data/flashcards.json');
    
    if (!fs.existsSync(dataPath)) {
        console.error(`ERRO: Arquivo ${dataPath} não encontrado para importar.`);
        console.log(`Você precisa extrair os dados do 'FLASHCARD_DATA' para um arquivo JSON antes de rodar o seed.`);
        process.exit(1);
    }

    try {
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const flashcards = JSON.parse(rawData);

        console.log(`Lidos ${flashcards.length} flashcards. Iniciando migração...`);

        const batch = db.batch();
        let count = 0;

        // Helper simples para gerar slug/id determinístico
        const generateId = (text) => {
            return text.toString().toLowerCase().trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        };

        for (const card of flashcards) {
            const deterministicId = card.id ? String(card.id) : generateId(card.prompt || 'card');
            const cardRef = db.collection('flashcards').doc(deterministicId);
            
            // Tratamento do documento para adequar ao novo schema
            const docData = {
                question: card.prompt || '',
                answer: card.answer || '',
                explanation: card.explanation || '',
                imageUrl: card.images ? card.images[0] : '', // Simplesmente pegando a primeira
                tags: card.tags || [],
                specialty: 'Neumología', // Default
                difficulty: 1, // Default
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                published: true,
                deleted: false
            };

            batch.set(cardRef, docData);
            count++;

            // O limite do batch no Firestore é 500
            if (count % 400 === 0) {
                await batch.commit();
                console.log(`Batch gravado (${count} cards)`);
            }
        }

        if (count % 400 !== 0) {
            await batch.commit();
        }

        console.log(`=== SEED CONCLUÍDO COM SUCESSO (${count} flashcards migrados) ===`);
    } catch (error) {
        console.error("Erro rodando o seed:", error);
    }
}

seedFirestore();
