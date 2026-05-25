// Schema Validation for Users
import { Logger } from '../core/logger.js';

export function validateUser(docData, docId = 'unknown') {
    if (!docData) return null;
    
    return {
        uid: docId,
        role: docData.role || 'user',
        displayName: docData.displayName || 'Unknown User',
        email: docData.email || '',
        createdAt: docData.createdAt || null
    };
}
