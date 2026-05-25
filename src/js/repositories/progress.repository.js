import { db } from '../services/firebase.service.js';
import { collection, doc, getDoc, getDocs, setDoc, query } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { validateProgress } from '../schemas/progress.schema.js';
import { Logger } from '../core/logger.js';

export const ProgressRepository = {
    async getUserProgress(uid) {
        try {
            const progressRef = collection(db, `users/${uid}/progress`);
            const q = query(progressRef);
            const querySnapshot = await getDocs(q);
            
            const progressMap = {};
            querySnapshot.forEach((docSnap) => {
                const progData = validateProgress(docSnap.data(), docSnap.id);
                progressMap[docSnap.id] = progData;
            });
            
            return progressMap;
        } catch (error) {
            Logger.error('ProgressRepository', `Failed to fetch progress for user ${uid}`, error);
            throw error;
        }
    },

    async updateCardProgress(uid, cardId, progressData) {
        try {
            const docRef = doc(db, `users/${uid}/progress`, cardId);
            
            // Usamos setDoc com merge: true para atualizar ou criar caso não exista
            await setDoc(docRef, progressData, { merge: true });
            
            return validateProgress(progressData, cardId);
        } catch (error) {
            Logger.error('ProgressRepository', `Failed to update progress for card ${cardId}`, error);
            throw error;
        }
    }
};
