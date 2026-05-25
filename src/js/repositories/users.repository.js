import { db } from '../services/firebase.service.js';
import { doc, getDoc, setDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { validateUser } from '../schemas/user.schema.js';
import { Logger } from '../core/logger.js';

export const UsersRepository = {
    async getUser(uid) {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                return validateUser(userSnap.data(), userSnap.id);
            }
            return null;
        } catch (error) {
            Logger.error('UsersRepository', `Failed to get user ${uid}`, error);
            throw error;
        }
    },

    async createUser(uid, userData) {
        try {
            const userRef = doc(db, 'users', uid);
            const payload = {
                ...userData,
                role: 'user', // Default safe role
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
            };
            
            await setDoc(userRef, payload);
            return validateUser(payload, uid);
        } catch (error) {
            Logger.error('UsersRepository', `Failed to create user ${uid}`, error);
            throw error;
        }
    },
    
    async updateLastLogin(uid) {
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, { lastLoginAt: new Date().toISOString() });
        } catch (error) {
            Logger.warn('UsersRepository', `Could not update last login for ${uid}`, error);
        }
    }
};
