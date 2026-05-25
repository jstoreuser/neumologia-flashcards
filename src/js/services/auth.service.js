import { auth } from './firebase.service.js';
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { UsersRepository } from '../repositories/users.repository.js';
import { Logger } from '../core/logger.js';

export const AuthService = {
    // Mantém estado de observador interno
    currentUser: null,
    claims: null,

    init(onUserChangedCallback) {
        // Habilitar persistência local explicitamente
        setPersistence(auth, browserLocalPersistence).catch((err) => {
            Logger.warn('AuthService', 'Persistence configuration failed', err);
        });

        // Escuta mudanças no Auth State
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Pega as Custom Claims do token (onde verificamos o admin: true)
                    const idTokenResult = await user.getIdTokenResult();
                    this.claims = idTokenResult.claims;
                    this.currentUser = user;
                    
                    // Opcional: Atualiza o último login no BD em background
                    UsersRepository.updateLastLogin(user.uid);
                    
                    Logger.info('AuthService', `User logged in: ${user.email} (Admin: ${this.isAdmin()})`);
                } catch (error) {
                    Logger.error('AuthService', 'Failed to fetch claims', error);
                }
            } else {
                this.currentUser = null;
                this.claims = null;
                Logger.info('AuthService', 'User logged out');
            }
            
            if (onUserChangedCallback) {
                onUserChangedCallback(this.currentUser, this.claims);
            }
        });
    },

    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            Logger.error('AuthService', 'Login failed', error);
            throw error;
        }
    },

    async logout() {
        try {
            await signOut(auth);
            // Ao deslogar, redireciona para login
            window.location.href = 'login.html';
        } catch (error) {
            Logger.error('AuthService', 'Logout failed', error);
            throw error;
        }
    },

    isAdmin() {
        return this.claims?.admin === true;
    },

    isAuthenticated() {
        return this.currentUser !== null;
    }
};
