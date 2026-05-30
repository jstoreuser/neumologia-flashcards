/**
 * Enriquece os 107 flashcards de radiologia pulmonar via Claude API.
 *
 * Lê src/data/formatted_texts.json, processa cada card individualmente e
 * escreve o resultado em src/data/enriched_flashcards.json para revisão.
 *
 * Uso:
 *   node scripts/enrich-flashcards.js            # processa todos os 107 cards
 *   node scripts/enrich-flashcards.js --dry-run  # mostra 3 cards de amostra sem escrever
 *
 * Requer ANTHROPIC_API_KEY no ambiente ou em .env.local
 */
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const isDryRun = process.argv.includes('--dry-run');
const resumeFrom = (() => {
  const idx = process.argv.indexOf('--resume');
  return idx !== -1 ? Number(process.argv[idx + 1]) : 0;
})();

// ─── Taxonomia ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Signos Radiológicos',
  'Patrones Intersticiales',
  'Patología Pleural',
  'Neoplasias Pulmonares',
  'Enfermedad Obstructiva',
  'Infecciones Pulmonares',
  'Otras Patologías',
];

const SUBCATEGORIES = {
  'Signos Radiológicos': ['Signos Parenquimatosos', 'Signos Pleurales', 'Signos Hiliares/Vasculares', 'Signos Mediastínicos'],
  'Patrones Intersticiales': ['Vidrio Esmerilado', 'Reticular/Panal de Abejas', 'Lineal (Kerley)', 'Nodular', 'Quístico'],
  'Patología Pleural': ['Neumotórax', 'Derrame Pleural'],
  'Neoplasias Pulmonares': ['Nódulo Solitario', 'Metástasis', 'Masas'],
  'Enfermedad Obstructiva': ['Enfisema/EPOC', 'Bronquiectasias'],
  'Infecciones Pulmonares': ['Neumonía Bacteriana', 'Neumonía Atípica/Viral', 'Tuberculosis', 'Absceso Pulmonar'],
  'Otras Patologías': ['Fibrosis Pulmonar', 'Atelectasia', 'LAM', 'Hamartoma/Quiste'],
};

// ─── Prompts ──────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Eres un radiólogo-docente experto en neumología y diagnóstico por imágenes pulmonares.
Tu tarea es enriquecer flashcards de radiología pulmonar para estudiantes de medicina.

TAXONOMÍA EXACTA que debes respetar:
Categorías: ${CATEGORIES.join(' | ')}
Subcategorías por categoría:
${Object.entries(SUBCATEGORIES).map(([c, s]) => `  ${c}: ${s.join(', ')}`).join('\n')}

INSTRUCCIONES PARA CADA CAMPO:

1. question — Pregunta específica a la imagen:
   - Extrae la modalidad exacta de la explicación (ej: "TC de tórax en ventana pulmonar sin contraste", "radiografía de tórax PA", etc.)
   - Formato: "¿Qué [signo/hallazgo/patrón] se observa en esta [modalidad exacta]?"
   - Si no hay modalidad concreta: "¿Qué hallazgo radiológico se visualiza en la imagen?"
   - Que la pregunta NO revele la respuesta.

2. answer — Descripción radiológica estilo presentación clínica:
   - Abre con el nombre del signo/hallazgo (sin markdown especial, texto plano)
   - Luego describe qué se ve: modalidad, ventana/proyección, hallazgos morfológicos (densidad, bordes, localización, distribución, tamaño relativo)
   - Cierra con 1 frase de clave diagnóstica o diferencial importante
   - NO solo el nombre del diagnóstico — describe la imagen
   - Extensión: 2-4 oraciones densas, texto plano sin HTML

3. explanation — HTML bien formateado y completo:
   - <p>Descripción detallada de los hallazgos radiológicos en la imagen</p>
   - <p>Mecanismo fisiopatológico o contexto clínico relevante, con perla diagnóstica</p>
   - Opcionalmente al final: <div class="exp-modality"><strong>Estudio:</strong> [modalidad completa]</div>
   - Si aplica: <div class="exp-dx"><strong>Diagnóstico:</strong> [dx]</div>
   - Si aplica: <div class="exp-causes"><strong>Causas comunes:</strong> [lista separada por comas]</div>
   - HTML limpio, sin clases extra, sin estilos inline

4. category — Exactamente una de la lista de categorías

5. subcategory — Subcategoría específica de esa categoría (de la lista)

6. tags — Array de 3-5 términos: modalidad de imagen, nombre del signo, patología, hallazgo morfológico

7. difficulty:
   - easy: signos clásicos muy frecuentes y reconocibles (neumotórax, Kerley, derrame pleural)
   - medium: patrones intersticiales, hallazgos intermedios, diagnósticos comunes
   - hard: entidades raras, diferencial complejo, patrones poco frecuentes (LAM, HAP)`;

// ─── Tool schema ──────────────────────────────────────────────────────────────

const ENRICH_TOOL = {
  name: 'enrich_flashcard',
  description: 'Devuelve el flashcard enriquecido con todos los campos requeridos',
  input_schema: {
    type: 'object',
    properties: {
      question: { type: 'string', description: 'Pregunta específica a la modalidad de imagen' },
      answer: { type: 'string', description: 'Respuesta descriptiva texto plano, estilo radiólogo presentando la imagen' },
      explanation: { type: 'string', description: 'Explicación en HTML limpio con hallazgos, mecanismo y contexto' },
      category: { type: 'string', enum: CATEGORIES, description: 'Categoría de la taxonomía' },
      subcategory: { type: 'string', description: 'Subcategoría específica de la categoría elegida' },
      tags: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 5, description: '3-5 términos clave' },
      difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'], description: 'Dificultad del card' },
    },
    required: ['question', 'answer', 'explanation', 'category', 'subcategory', 'tags', 'difficulty'],
  },
};

// ─── API call ─────────────────────────────────────────────────────────────────

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function enrichCard(key, card, retries = 3) {
  const imageUrl = `assets/images/img_pagina_${key}_1.jpeg`;

  const userMessage = `Enriquece este flashcard de radiología pulmonar:

PREGUNTA ACTUAL: ${card.prompt || card.question || '(sin pregunta)'}
RESPUESTA ACTUAL: ${card.answer || '(sin respuesta)'}
EXPLICACIÓN ACTUAL: ${card.explanation || '(sin explicación)'}

Genera todos los campos del flashcard enriquecido. El imageUrl ya está asignado: "${imageUrl}"`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
        tools: [ENRICH_TOOL],
        tool_choice: { type: 'tool', name: 'enrich_flashcard' },
      });

      const toolUse = response.content.find((b) => b.type === 'tool_use');
      if (!toolUse) throw new Error('No tool_use block in response');

      return {
        prompt: card.prompt || card.question || '',
        ...toolUse.input,
        imageUrl,
      };
    } catch (err) {
      const isRateLimit = err.status === 429 || err.message?.includes('rate');
      if (attempt < retries) {
        const delay = isRateLimit ? 10000 : 2000 * attempt;
        process.stdout.write(` [retry ${attempt}/${retries} in ${delay / 1000}s]`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ERRO: ANTHROPIC_API_KEY não encontrada. Defina no .env.local ou no ambiente.');
    process.exit(1);
  }

  const dataPath = path.resolve(__dirname, '../src/data/formatted_texts.json');
  if (!existsSync(dataPath)) {
    console.error(`ERRO: Arquivo não encontrado: ${dataPath}`);
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(dataPath, 'utf-8'));

  // Sort entries numerically to match seed-firestore.js Object.values() order
  const entries = Object.entries(raw).sort(([a], [b]) => Number(a) - Number(b));
  const limit = isDryRun ? 3 : entries.length;

  const outPath = path.resolve(__dirname, '../src/data/enriched_flashcards.json');

  // --resume: load partial output if it exists
  let enriched = {};
  if (resumeFrom > 0 && existsSync(outPath)) {
    enriched = JSON.parse(readFileSync(outPath, 'utf-8'));
    console.log(`Retomando de ${resumeFrom} (${Object.keys(enriched).length} já processados)`);
  }

  console.log(`\n=== ENRIQUECENDO ${limit} FLASHCARDS${isDryRun ? ' (DRY RUN)' : ''} ===\n`);

  for (let i = resumeFrom; i < limit; i++) {
    const [key, card] = entries[i];
    const label = `${(card.answer || '').slice(0, 35).padEnd(35)}`;
    process.stdout.write(`[${String(i + 1).padStart(3)}/${limit}] Key ${key} — ${label} `);

    try {
      const result = await enrichCard(key, card);
      enriched[key] = result;
      console.log(`✓  ${result.category} / ${result.subcategory}`);
    } catch (err) {
      console.error(`✗  ERRO: ${err.message}`);
      enriched[key] = {
        prompt: card.prompt || '',
        question: card.prompt || '',
        answer: card.answer || '',
        explanation: card.explanation || '',
        imageUrl: `assets/images/img_pagina_${key}_1.jpeg`,
        category: 'General',
        subcategory: '',
        tags: [],
        difficulty: 'medium',
        _error: err.message,
      };
    }

    // Save progress every 10 cards (in case of interruption)
    if (!isDryRun && (i + 1) % 10 === 0) {
      writeFileSync(outPath, JSON.stringify(enriched, null, 2), 'utf-8');
      console.log(`  → Progresso salvo (${i + 1}/${limit})`);
    }

    // Rate limiting pause between calls
    if (i < limit - 1) await new Promise((r) => setTimeout(r, 350));
  }

  if (isDryRun) {
    console.log('\n=== AMOSTRA DRY RUN ===\n');
    Object.entries(enriched).forEach(([key, card]) => {
      console.log(`--- Card ${key} ---`);
      console.log('Q:', card.question);
      console.log('A:', card.answer);
      console.log('Exp (50 chars):', (card.explanation || '').slice(0, 50));
      console.log('Cat:', card.category, '/', card.subcategory);
      console.log('Tags:', card.tags);
      console.log('Diff:', card.difficulty);
      console.log('ImageUrl:', card.imageUrl);
      console.log('');
    });
    console.log('Dry run concluído. Rode sem --dry-run para processar todos os cards.');
    return;
  }

  writeFileSync(outPath, JSON.stringify(enriched, null, 2), 'utf-8');

  const errors = Object.values(enriched).filter((c) => c._error).length;
  console.log(`\n=== CONCLUÍDO: ${Object.keys(enriched).length} cards escritos em src/data/enriched_flashcards.json ===`);
  if (errors > 0) console.warn(`⚠ ${errors} cards com erro (marcados com _error — revise manualmente)`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
