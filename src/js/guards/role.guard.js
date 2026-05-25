import { AuthService } from '../services/auth.service.js';

/**
 * Garante que a página só renderize se o usuário for Admin via Custom Claims.
 * Usado em admin.html
 */
export function requireAdmin() {
    return new Promise((resolve, reject) => {
        AuthService.init((user, claims) => {
            if (!user) {
                // Não está logado, manda para o login
                window.location.href = 'login.html';
                reject('User not authenticated');
            } else if (claims && claims.admin === true) {
                // É admin real (via JWT token claim)
                resolve(user);
            } else {
                // Logado mas não tem permissão
                const errorOverlay = document.getElementById('admin-error-overlay');
                if (errorOverlay) {
                    errorOverlay.classList.remove('hidden');
                    document.getElementById('admin-workspace').style.display = 'none';
                }
                reject('Permission denied. Admin claim missing.');
            }
        });
    });
}
