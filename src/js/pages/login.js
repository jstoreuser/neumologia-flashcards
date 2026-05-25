import { AuthService } from '../services/auth.service.js';
import { Logger } from '../core/logger.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const errorOverlay = document.getElementById('auth-error-overlay');
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    // Inicializa observador de auth para redirecionar caso já esteja logado
    AuthService.init((user, claims) => {
        if (user) {
            // Se já está logado, avalia a role e redireciona
            if (claims && claims.admin === true) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) return;

        // UI Feedback: Loading
        submitBtn.disabled = true;
        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Verificando...</span>';
        errorOverlay.classList.add('hidden');

        try {
            await AuthService.login(email, password);
            // O onAuthStateChanged do AuthService.init pegará a mudança e redirecionará.
        } catch (error) {
            Logger.warn('Login', 'Invalid credentials', error);
            
            // Cyberpunk Error Feedback
            errorOverlay.classList.remove('hidden');
            
            // Reset UI
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
            passwordInput.value = '';
        }
    });
});
