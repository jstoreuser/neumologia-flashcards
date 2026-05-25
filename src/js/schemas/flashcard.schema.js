// Schema Validation for Flashcards
import { Logger } from '../core/logger.js';

export function validateFlashcard(docData, docId = 'unknown') {
    const requiredFields = ['question', 'answer'];
    const missing = requiredFields.filter(f => !docData[f]);

    if (missing.length > 0) {
        Logger.warn('SchemaValidator', `Flashcard ${docId} is missing fields: ${missing.join(', ')}`);
        // Pode definir dados de fallback para evitar quebra de UI
        return {
            ...docData,
            question: docData.question || '[Erro de Sincronização]',
            answer: docData.answer || '[Dado Corrompido]',
            isValid: false
        };
    }
    return { ...docData, isValid: true };
}
