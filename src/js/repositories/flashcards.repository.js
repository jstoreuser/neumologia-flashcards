import { db } from '../services/firebase.service.js';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { validateFlashcard } from '../schemas/flashcard.schema.js';
import { Logger } from '../core/logger.js';

// Cache em memória rudimentar (Firebase já faz cache local, mas isso economiza listeners)
let localCardsCache = [];
let cacheTimestamp = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutos

export const FlashcardsRepository = {
    async getAllPublished() {
        // Se temos cache válido, usa cache
        if (localCardsCache.length > 0 && (Date.now() - cacheTimestamp) < CACHE_TTL) {
            Logger.info('FlashcardsRepository', 'Serving cards from memory cache');
            return localCardsCache;
        }

        try {
            const q = query(
                collection(db, 'flashcards'), 
                where('published', '==', true),
                where('deleted', '==', false)
            );
            
            const querySnapshot = await getDocs(q);
            const cards = [];
            
            querySnapshot.forEach((docSnap) => {
                const cardData = validateFlashcard(docSnap.data(), docSnap.id);
                if (cardData.isValid) {
                    cards.push({ id: docSnap.id, ...cardData });
                }
            });

            // Atualiza o cache
            localCardsCache = cards;
            cacheTimestamp = Date.now();
            
            Logger.info('FlashcardsRepository', `Fetched ${cards.length} cards from Firestore`);
            return cards;
        } catch (error) {
            Logger.error('FlashcardsRepository', 'Failed to fetch published cards', error);
            // Em caso de erro de rede, tenta servir o cache velho se existir
            if (localCardsCache.length > 0) {
                Logger.warn('FlashcardsRepository', 'Serving STALE cache due to network error');
                return localCardsCache;
            }
            throw error;
        }
    },

    async getAllAdmin() {
        try {
            const q = query(collection(db, 'flashcards'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const cards = [];
            
            querySnapshot.forEach((docSnap) => {
                const cardData = validateFlashcard(docSnap.data(), docSnap.id);
                cards.push({ id: docSnap.id, ...cardData });
            });
            
            return cards;
        } catch (error) {
            Logger.error('FlashcardsRepository', 'Failed to fetch admin cards', error);
            throw error;
        }
    },

    async getCard(cardId) {
        try {
            const docRef = doc(db, 'flashcards', cardId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return { id: docSnap.id, ...validateFlashcard(docSnap.data(), docSnap.id) };
            }
            return null;
        } catch (error) {
            Logger.error('FlashcardsRepository', `Failed to fetch card ${cardId}`, error);
            throw error;
        }
    },

    // Admin methods (CRUD)
    async createCard(cardData, createdByUid) {
        try {
            // Usa o helper de slug se desejar, mas setDoc com doc() gera ID
            const docRef = doc(collection(db, 'flashcards'));
            const payload = {
                ...cardData,
                createdBy: createdByUid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                published: cardData.published ?? false,
                deleted: false
            };
            
            await setDoc(docRef, payload);
            
            // Invalida o cache
            localCardsCache = []; 
            
            return { id: docRef.id, ...payload };
        } catch (error) {
            Logger.error('FlashcardsRepository', 'Failed to create card', error);
            throw error;
        }
    },

    async softDelete(cardId) {
        try {
            const docRef = doc(db, 'flashcards', cardId);
            await updateDoc(docRef, { 
                deleted: true, 
                deletedAt: new Date().toISOString() 
            });
            
            // Invalida o cache
            localCardsCache = [];
            return true;
        } catch (error) {
            Logger.error('FlashcardsRepository', `Failed to soft delete card ${cardId}`, error);
            throw error;
        }
    }
};
