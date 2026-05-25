import { AuthService } from '../services/auth.service.js';

/**
 * Garante que a página só seja acessível por usuários logados.
 * Usado na workstation de estudos (index.html)
 */
export function requireAuth() {
    return new Promise((resolve, reject) => {
        AuthService.init((user, claims) => {
            if (!user) {
                // Se não está logado, redireciona para a página de login
                window.location.href = 'login.html';
                reject('User not authenticated');
            } else {
                resolve({ user, claims });
            }
        });
    });
}
