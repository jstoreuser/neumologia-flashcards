"use strict";
/**
 * onUserCreate — Firebase Auth trigger
 *
 * Fires when a new user is created (e.g., email/password or Google Sign-In).
 * Creates a Firestore user profile document with role: 'student'.
 *
 * This ensures the profile always exists, even if the client-side
 * createUserProfile() call fails (network error, crash, etc.).
 * The Firestore rule only allows creating with role: 'student',
 * so this server-side creation is the authoritative fallback.
 *
 * The client-side createUserProfile() is still kept (idempotent via
 * existence check), but this function is the safety net.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserProfile = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
(0, app_1.initializeApp)();
exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
    const db = (0, firestore_1.getFirestore)();
    const ref = db.collection('users').doc(user.uid);
    const snapshot = await ref.get();
    // Idempotent: only create if profile doesn't already exist
    if (snapshot.exists)
        return;
    await ref.set({
        uid: user.uid,
        email: user.email ?? '',
        displayName: user.displayName ?? null,
        role: 'student',
        preferences: { theme: 'dark', dailyGoal: 30 },
        createdAt: firestore_1.FieldValue.serverTimestamp(),
        lastLoginAt: firestore_1.FieldValue.serverTimestamp(),
    });
});
