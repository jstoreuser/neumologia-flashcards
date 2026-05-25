// Schema Validation for Progress
import { Logger } from '../core/logger.js';

export function validateProgress(docData, docId = 'unknown') {
    if (!docData) return null;

    return {
        cardId: docId,
        interval: docData.interval || 0,
        easeFactor: docData.easeFactor || 2.5,
        repetitions: docData.repetitions || 0,
        nextReview: docData.nextReview || new Date().toISOString(),
        lastReview: docData.lastReview || null,
        lapses: docData.lapses || 0
    };
}
