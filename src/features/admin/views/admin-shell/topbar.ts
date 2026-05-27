import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { StoreController } from '@/shared/utils/lit-helpers';
import { useAdminStore, adminActions } from '../../store';
import { selectFlashcardsList, selectUsersList } from '../../selectors';

@customElement('barcl-admin-topbar')
export class BarclAdminTopbar extends LitElement {
  override createRenderRoot() { return this; }
  private _admin = new StoreController(this, useAdminStore);

  override render() {
    const { activeView } = this._admin.value;
    const isFlashcards = activeView === 'flashcards';
    
    // Stats for the topbar
    const flashcardsCount = selectFlashcardsList(this._admin.value).length;
    const usersCount = selectUsersList(this._admin.value).length;
    const title = isFlashcards ? 'Banco de Dados' : 'Usuários do Sistema';
    const subtitle = isFlashcards ? `${flashcardsCount} Cards Carregados` : `${usersCount} Contas Registradas`;

    return html`
      <header style="height: 80px; background: #0a0a0a; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; padding: 0 32px;">
        <div>
          <h1 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 1.5rem; font-weight: 600; color: var(--text-primary); letter-spacing: 0.5px;">${title}</h1>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">${subtitle}</div>
        </div>

        ${isFlashcards ? html`
          <button @click=${() => adminActions.openCreateEditor()} class="btn primary" style="font-family: 'Space Grotesk', sans-serif; font-weight: 600; padding: 10px 20px;">
            + NOVO CARD
          </button>
        ` : ''}
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'barcl-admin-topbar': BarclAdminTopbar;
  }
}
