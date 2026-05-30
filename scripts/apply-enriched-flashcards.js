/**
 * Aplica os flashcards enriquecidos ao Firestore.
 *
 * Lê src/data/enriched_flashcards.json e atualiza os documentos existentes
 * usando batch.update() — NÃO toca em isPublished, isDeleted, createdAt,
 * authorId ou schemaVersion.
 *
 * Uso:
 *   node scripts/apply-enriched-flashcards.js            # aplica ao Firestore
 *   node scripts/apply-enriched-flashcards.js --dry-run  # preview dos primeiros 5 docs
 *
 * Requer service-account.json (ou GOOGLE_APPLICATION_CREDENTIALS) no projeto.
 */
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const isDryRun = process.argv.includes('--dry-run');

// ─── Firebase init ────────────────────────────────────────────────────────────

const serviceAccountPath = path.resolve(__dirname, '../service-account.json');
if (!existsSync(serviceAccountPath)) {
  console.error('ERRO: service-account.json não encontrado na raiz do projeto.');
  process.exit(1);
}

initializeApp({
  credential: cert(JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))),
  projectId: process.env.FIREBASE_PROJECT_ID || 'barcl-6e65e',
});

const db = getFirestore();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_DIFFICULTIES = new Set(['easy', 'medium', 'hard']);

function normalizeDifficulty(raw) {
  return VALID_DIFFICULTIES.has(raw) ? raw : 'medium';
}

// Must match seed-firestore.js ID generation exactly:
// entries are sorted by numeric key → index i → "neumologia_XXXX"
function firestoreId(index, specialty = 'neumologia') {
  return `${specialty.toLowerCase().replace(/\s+/g, '-')}_${index.toString().padStart(4, '0')}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const dataPath = path.resolve(__dirname, '../src/data/enriched_flashcards.json');
  if (!existsSync(dataPath)) {
    console.error('ERRO: src/data/enriched_flashcards.json não encontrado.');
    console.error('Rode primeiro: node scripts/enrich-flashcards.js');
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(dataPath, 'utf-8'));

  // Sort numerically — MUST match seed-firestore.js Object.values() order
  const entries = Object.entries(raw).sort(([a], [b]) => Number(a) - Number(b));

  const withErrors = entries.filter(([, c]) => c._error);
  if (withErrors.length > 0) {
    console.warn(`⚠ ${withErrors.length} card(s) marcados com _error serão pulados:`);
    withErrors.forEach(([k, c]) => console.warn(`  - Key ${k}: ${c._error}`));
  }

  const toUpdate = entries.filter(([, c]) => !c._error);
  console.log(`\n=== APLICANDO ${toUpdate.length} FLASHCARDS AO FIRESTORE${isDryRun ? ' (DRY RUN)' : ''} ===\n`);

  const BATCH_SIZE = 400;
  let batch = db.batch();
  let batchCount = 0;
  let totalUpdated = 0;

  for (let i = 0; i < entries.length; i++) {
    const [key, card] = entries[i];

    if (card._error) continue;

    // Use the JSON key directly as the Firestore document ID.
    // The original seed stored docs with their numeric key as the ID ("2", "3"…).
    // Using index i would generate neumologia_XXXX IDs that don't match.
    const docId = key;

    const updateData = {
      question: card.question || '',
      answer: card.answer || '',
      explanation: card.explanation || '',
      category: card.category || 'General',
      subcategory: card.subcategory || '',
      tags: Array.isArray(card.tags) ? card.tags : [],
      difficulty: normalizeDifficulty(card.difficulty),
      imageUrl: card.imageUrl || null,
      updatedAt: FieldValue.serverTimestamp(),
      // NOT touched: isPublished, isDeleted, createdAt, authorId, schemaVersion, order, specialty
    };

    if (isDryRun) {
      if (totalUpdated < 5) {
        console.log(`[DRY RUN] ${docId} (key ${key}):`);
        console.log(`  Q: ${updateData.question.slice(0, 80)}`);
        console.log(`  A: ${updateData.answer.slice(0, 80)}`);
        console.log(`  Cat: ${updateData.category} / ${updateData.subcategory}`);
        console.log(`  Tags: ${updateData.tags.join(', ')}`);
        console.log(`  Diff: ${updateData.difficulty}  ImageUrl: ${updateData.imageUrl}`);
        console.log('');
      }
      totalUpdated++;
      continue;
    }

    const cardRef = db.collection('flashcards').doc(docId);
    batch.set(cardRef, updateData, { merge: true });
    batchCount++;
    totalUpdated++;

    if (batchCount === BATCH_SIZE) {
      await batch.commit();
      console.log(`  Batch committed (${totalUpdated} cards atualizados)`);
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (!isDryRun && batchCount > 0) {
    await batch.commit();
  }

  if (isDryRun) {
    console.log(`Dry run: ${totalUpdated} cards seriam atualizados. ${withErrors.length} seriam pulados.`);
    console.log('Rode sem --dry-run para aplicar ao Firestore.');
    return;
  }

  console.log(`\n=== CONCLUÍDO: ${totalUpdated} cards atualizados no Firestore ===`);
  if (withErrors.length > 0) {
    console.warn(`⚠ ${withErrors.length} cards pulados — corrija manualmente e re-rode.`);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
