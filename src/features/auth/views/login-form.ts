import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { sanitizeHtml } from '@/shared/utils/sanitizer';
import {
  loginWithEmail,
  registerWithEmail,
  resendVerificationEmail,
  refreshEmailVerification,
} from '../auth.service';
import { logout } from '../auth.service';
import { observeAuthState } from '../auth.service';
import type { User } from 'firebase/auth';

type AuthView = 'login' | 'register' | 'verify';

/**
 * <barcl-login-form>
 *
 * Self-contained auth form component. Handles all three views:
 * 1. Login form
 * 2. Register form
 * 3. Email verification pending screen
 *
 * Lit auto-escapes all template interpolations — no XSS risk.
 * DOMPurify is still used for any user-input displayed in error messages.
 */
@customElement('barcl-login-form')
export class BarclLoginForm extends LitElement {
  // Disable shadow DOM to use the page's global CSS (glassmorphism, tokens etc.)
  override createRenderRoot() { return this; }

  @state() private view: AuthView = 'login';
  @state() private errorMessage = '';
  @state() private successMessage = '';
  @state() private isLoading = false;
  @state() private pendingUser: User | null = null;

  override connectedCallback() {
    super.connectedCallback();

    // If user is already in a verification-pending state, show that view
    const unsubscribe = observeAuthState((user) => {
      unsubscribe();
      if (user && !user.emailVerified) {
        this.pendingUser = user;
        this.view = 'verify';
      }
    });
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  override render() {
    return html`
      <div class="pacs-panel glassmorphism auth-panel">

        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 25px;">
          <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="barcl-hero-logo" style="filter: drop-shadow(0 0 5px var(--primary-glow));">
            <path d="M4 4h16v16H4z"/><path d="M12 4v16"/><path d="M4 12h16"/>
          </svg>
          <h1 style="margin-top: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: 1px;">BARCL</h1>
          <p id="auth-panel-subtitle" style="color: var(--text-secondary); font-size: 0.9rem;">
            ${this.view === 'verify' ? 'Verificación de cuenta' : 'Acceso al sistema PACS'}
          </p>
        </div>

        <!-- Banners -->
        ${this.errorMessage ? html`
          <div class="auth-error-banner" role="alert">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            ${this.errorMessage}
          </div>
        ` : ''}
        ${this.successMessage ? html`
          <div class="auth-success-banner" role="status">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"/></svg>
            ${this.successMessage}
          </div>
        ` : ''}

        ${this.view === 'login' ? this._renderLogin() : ''}
        ${this.view === 'register' ? this._renderRegister() : ''}
        ${this.view === 'verify' ? this._renderVerify() : ''}
      </div>
    `;
  }

  private _renderLogin() {
    return html`
      <!-- Tabs -->
      <div style="display: flex; gap: 10px; margin-bottom: 25px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px;">
        <button type="button" class="auth-tab-btn active" @click=${() => this._switchView('login')}
          style="flex: 1; padding: 10px; background: none; border: none; color: white; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-weight: 600; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 1px;">
          Acceder
        </button>
        <button type="button" class="auth-tab-btn" @click=${() => this._switchView('register')}
          style="flex: 1; padding: 10px; background: none; border: none; color: var(--text-secondary); cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-weight: 600; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 1px;">
          Registrarse
        </button>
      </div>

      <form @submit=${this._handleLogin}>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 6px; color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase;">E-mail</label>
          <input type="email" id="login-email" class="auth-field" required placeholder="ejemplo@gmail.com" ?disabled=${this.isLoading}>
        </div>
        <div style="margin-bottom: 30px;">
          <label style="display: block; margin-bottom: 6px; color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase;">Contraseña</label>
          <input type="password" id="login-password" class="auth-field" required placeholder="••••••••" ?disabled=${this.isLoading}>
        </div>
        <button type="submit" class="btn btn-primary btn-large btn-full-width" ?disabled=${this.isLoading}>
          ${this.isLoading ? html`<span class="spinner"></span>Accediendo...` : html`<span>Acceder</span>`}
        </button>
      </form>
    `;
  }

  private _renderRegister() {
    return html`
      <!-- Tabs -->
      <div style="display: flex; gap: 10px; margin-bottom: 25px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px;">
        <button type="button" class="auth-tab-btn" @click=${() => this._switchView('login')}
          style="flex: 1; padding: 10px; background: none; border: none; color: var(--text-secondary); cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-weight: 600; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 1px;">
          Acceder
        </button>
        <button type="button" class="auth-tab-btn active" @click=${() => this._switchView('register')}
          style="flex: 1; padding: 10px; background: none; border: none; color: white; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-weight: 600; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 1px;">
          Registrarse
        </button>
      </div>

      <form @submit=${this._handleRegister}>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 6px; color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase;">Usuario</label>
          <input type="text" id="register-name" class="auth-field" required placeholder="usuario123" ?disabled=${this.isLoading}>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 6px; color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase;">E-mail</label>
          <input type="email" id="register-email" class="auth-field" required placeholder="ejemplo@gmail.com" ?disabled=${this.isLoading}>
        </div>
        <div style="margin-bottom: 25px;">
          <label style="display: block; margin-bottom: 6px; color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase;">Contraseña (Min. 6 caracteres)</label>
          <input type="password" id="register-password" class="auth-field" required minlength="6" placeholder="••••••••" ?disabled=${this.isLoading}>
        </div>
        <button type="submit" class="btn btn-primary btn-large btn-full-width" ?disabled=${this.isLoading}>
          ${this.isLoading ? html`<span class="spinner"></span>Creando cuenta...` : html`<span>Crear Cuenta</span>`}
        </button>
      </form>
    `;
  }

  private _renderVerify() {
    return html`
      <div style="text-align: center; padding: 10px 0;">
        <div style="background: rgba(0, 242, 254, 0.05); border: 1px dashed var(--primary); padding: 20px; border-radius: 4px; margin-bottom: 25px;">
          <svg viewBox="0 0 24 24" width="36" height="36" stroke="var(--primary)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 15px; filter: drop-shadow(0 0 3px var(--primary-glow));">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <h3 style="font-family: 'Space Grotesk', sans-serif; color: white; margin-bottom: 10px; text-transform: uppercase;">Verificación Requerida</h3>
          <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.4;">
            Hemos enviado un enlace de confirmación a tu e-mail. Por favor, revisa tu bandeja de entrada (y la carpeta de spam).
          </p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button class="btn btn-primary btn-large btn-full-width" @click=${this._handleVerifyRefresh} ?disabled=${this.isLoading}>
            ${this.isLoading ? html`<span class="spinner"></span>Verificando...` : html`<span>He verificado mi cuenta (Actualizar)</span>`}
          </button>
          <button class="btn btn-secondary btn-full-width" @click=${this._handleVerifyResend} ?disabled=${this.isLoading}
            style="background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: white;">
            <span>Reenviar E-mail de Verificación</span>
          </button>
          <button class="btn btn-danger btn-full-width" @click=${this._handleVerifyLogout}
            style="margin-top: 10px; background: rgba(255, 51, 51, 0.1); border: 1px solid #ff3333; color: #ff5555;">
            <span>Salir / Iniciar con otra cuenta</span>
          </button>
        </div>
      </div>
    `;
  }

  // ── Event Handlers ───────────────────────────────────────────────────────────

  private async _handleLogin(e: Event) {
    e.preventDefault();
    this._clearMessages();
    this.isLoading = true;

    const email = (this.querySelector<HTMLInputElement>('#login-email'))?.value ?? '';
    const password = (this.querySelector<HTMLInputElement>('#login-password'))?.value ?? '';

    try {
      const user = await loginWithEmail(email, password);
      if (!user.emailVerified) {
        this.pendingUser = user;
        this.view = 'verify';
      } else {
        const idToken = await user.getIdTokenResult();
        if (idToken.claims.admin) {
          window.location.replace('/admin.html');
        } else {
          window.location.replace('/index.html');
        }
      }
    } catch (err) {
      this.errorMessage = err instanceof Error ? sanitizeHtml(err.message) : 'Error desconocido';
    } finally {
      this.isLoading = false;
    }
  }

  private async _handleRegister(e: Event) {
    e.preventDefault();
    this._clearMessages();
    this.isLoading = true;

    const name = (this.querySelector<HTMLInputElement>('#register-name'))?.value ?? '';
    const email = (this.querySelector<HTMLInputElement>('#register-email'))?.value ?? '';
    const password = (this.querySelector<HTMLInputElement>('#register-password'))?.value ?? '';

    try {
      const user = await registerWithEmail(email, password, name);
      this.pendingUser = user;
      this.view = 'verify';
      this.successMessage = '¡Cuenta creada! Revisa tu correo para verificarla.';
    } catch (err) {
      this.errorMessage = err instanceof Error ? sanitizeHtml(err.message) : 'Error al registrarse';
    } finally {
      this.isLoading = false;
    }
  }

  private async _handleVerifyRefresh() {
    if (!this.pendingUser) return;
    this._clearMessages();
    this.isLoading = true;

    try {
      const verified = await refreshEmailVerification(this.pendingUser);
      if (verified) {
        const idToken = await this.pendingUser.getIdTokenResult();
        if (idToken.claims.admin) {
          window.location.replace('/admin.html');
        } else {
          window.location.replace('/index.html');
        }
      } else {
        this.errorMessage = 'Email aún no verificado. Revisa tu bandeja.';
      }
    } catch (err) {
      this.errorMessage = err instanceof Error ? sanitizeHtml(err.message) : 'Error al verificar';
    } finally {
      this.isLoading = false;
    }
  }

  private async _handleVerifyResend() {
    if (!this.pendingUser) return;
    this._clearMessages();

    try {
      await resendVerificationEmail(this.pendingUser);
      this.successMessage = 'Email reenviado. Revisa tu bandeja de entrada.';
    } catch (err) {
      this.errorMessage = err instanceof Error ? sanitizeHtml(err.message) : 'Error al reenviar';
    }
  }

  private async _handleVerifyLogout() {
    try {
      await logout();
      this.pendingUser = null;
      this.view = 'login';
      this._clearMessages();
    } catch {
      this.errorMessage = 'Error al cerrar sesión';
    }
  }

  private _switchView(view: AuthView) {
    this._clearMessages();
    this.view = view;
  }

  private _clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // No shadow DOM styles — uses global page CSS
  static override styles = css``;
}

declare global {
  interface HTMLElementTagNameMap {
    'barcl-login-form': BarclLoginForm;
  }
}
