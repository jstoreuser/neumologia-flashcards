"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSrs = void 0;
const https_1 = require("firebase-functions/v2/https");
/**
 * Backend-enforced Spaced Repetition System logic.
 * The client sends the card ID and their rating (wrong/hard/easy).
 * The backend computes the new intervals ensuring the client cannot cheat or inject state.
 */
exports.calculateSrs = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated to submit reviews');
    }
    // Parse payload using Zod (Boundary protection)
    const payload = {
        cardId: request.data.cardId,
        rating: request.data.rating, // 'wrong' | 'hard' | 'easy'
    };
    if (!payload.cardId || !['wrong', 'hard', 'easy'].includes(payload.rating)) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid payload');
    }
    // Example backend logic:
    // 1. Fetch current progress from Firestore securely
    // 2. Compute new Ease Factor and Interval
    // 3. Save directly to DB, returning the new state
    return { success: true, updatedInterval: 5 }; // stub
});
