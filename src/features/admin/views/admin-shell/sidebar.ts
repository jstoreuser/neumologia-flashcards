import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { StoreController } from '@/shared/utils/lit-helpers';
import { useAdminStore, adminActions } from '../../store';
import { fetchFlashcards, fetchUsers } from '../../admin.actions';
import { logout } from '@/features/auth/auth.service';

@customElement('barcl-admin-sidebar')
export class BarclAdminSidebar extends LitElement {
  override createRenderRoot() { return this; }
  private _admin = new StoreController(this, useAdminStore);

  private _navigate(view: 'flashcards' | 'users') {
    adminActions.setView(view);
    if (view === 'flashcards' && this._admin.value.flashcardsStatus === 'idle') {
      fetchFlashcards();
    } else if (view === 'users' && this._admin.value.usersStatus === 'idle') {
      fetchUsers();
    }
  }

  private async _handleLogout() {
    try {
      await logout();
      window.location.replace('/login.html');
    } catch (err) {
      console.error('[BARCL ADMIN] Logout failed:', err);
    }
  }

  override render() {
    const { activeView } = this._admin.value;
    
    return html`
      <aside style="width: 260px; background: #0a0a0a; border-right: 1px solid var(--border-color); display: flex; flex-direction: column; height: 100%;">
        <div style="padding: 24px; border-bottom: 1px solid var(--border-color);">
          <div style="font-family: 'Space Grotesk', sans-serif; font-size: 1.4rem; font-weight: 700; letter-spacing: 2px;">BARCL</div>
          <div style="font-size: 0.75rem; color: var(--primary); text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">Admin Panel</div>
        </div>

        <nav style="flex: 1; padding: 24px 16px; display: flex; flex-direction: column; gap: 8px;">
          <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; padding-left: 8px;">Menu Principal</div>
          
          <button @click=${() => this._navigate('flashcards')} style="
            background: ${activeView === 'flashcards' ? 'rgba(0,242,254,0.1)' : 'transparent'};
            color: ${activeView === 'flashcards' ? 'var(--primary)' : 'var(--text-secondary)'};
            border: 1px solid ${activeView === 'flashcards' ? 'rgba(0,242,254,0.2)' : 'transparent'};
            border-radius: 6px; padding: 12px 16px; text-align: left; cursor: pointer;
            font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 0.9rem; transition: all 0.2s;">
            <span style="margin-right: 8px;">🗃️</span> Banco de Dados
          </button>
          
          <button @click=${() => this._navigate('users')} style="
            background: ${activeView === 'users' ? 'rgba(0,242,254,0.1)' : 'transparent'};
            color: ${activeView === 'users' ? 'var(--primary)' : 'var(--text-secondary)'};
            border: 1px solid ${activeView === 'users' ? 'rgba(0,242,254,0.2)' : 'transparent'};
            border-radius: 6px; padding: 12px 16px; text-align: left; cursor: pointer;
            font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 0.9rem; transition: all 0.2s;">
            <span style="margin-right: 8px;">👥</span> Usuários
          </button>
        </nav>

        <div style="padding: 24px; border-top: 1px solid var(--border-color);">
          <button @click=${this._handleLogout} style="
            width: 100%; background: rgba(255,51,51,0.1); color: #ff5555; border: 1px solid rgba(255,51,51,0.2);
            border-radius: 6px; padding: 12px; cursor: pointer; font-family: 'Space Grotesk', sans-serif;
            font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; transition: all 0.2s;">
            Sair da Conta
          </button>
        </div>
      </aside>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'barcl-admin-sidebar': BarclAdminSidebar;
  }
}
