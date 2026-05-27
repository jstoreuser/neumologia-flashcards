/**
 * <barcl-card-list>
 *
 * Admin table of all flashcards with edit/delete actions.
 * Loads paginated via admin.service.adminGetFlashcardsPage().
 */

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { StoreController } from '@/shared/utils/lit-helpers';
import { useAdminStore, adminActions } from '../store';
import {
  adminGetFlashcardsPage,
  adminSoftDeleteFlashcard,
  adminRestoreFlashcard,
} from '../admin.service';
import { sanitizeHtml } from '@/shared/utils/sanitizer';
import type { Flashcard } from '@shared/contracts';

@customElement('barcl-card-list')
export class BarclCardList extends LitElement {
  override createRenderRoot() { return this; }

  private _admin = new StoreController(this, useAdminStore);

  override connectedCallback() {
    super.connectedCallback();
    // Load first page on mount if empty
    if (this._admin.value.flashcards.length === 0) {
      this._loadPage(/* reset= */ true);
    }
  }

  override render() {
    const { flashcards, isLoadingCards, hasMoreCards, error } = this._admin.value;

    return html`
      <!-- Toolbar -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1rem; text-transform: uppercase; letter-spacing: 1px; margin: 0;">
          Flashcards <span style="color: var(--text-secondary); font-size: 0.85rem;">(${flashcards.length} carregados)</span>
        </h3>
        <button
          id="admin-create-card-btn"
          class="btn btn-primary"
          @click=${adminActions.openCreateEditor}
          style="padding: 8px 18px; font-size: 0.85rem;"
        >
          + Novo Card
        </button>
      </div>

      ${error ? html`
        <div class="auth-error-banner" role="alert" style="margin-bottom: 16px;">${sanitizeHtml(error)}</div>
      ` : ''}

      <!-- Table -->
      <div style="overflow-x: auto;">
        <table style="
          width: 100%; border-collapse: collapse;
          font-family: 'Space Grotesk', sans-serif; font-size: 0.82rem;
        ">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color); text-align: left;">
              <th style="padding: 10px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;">Pergunta</th>
              <th style="padding: 10px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;">Categoria</th>
              <th style="padding: 10px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;">Dif.</th>
              <th style="padding: 10px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;">Status</th>
              <th style="padding: 10px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${flashcards.map(card => this._renderRow(card))}
          </tbody>
        </table>
      </div>

      <!-- Load more -->
      ${hasMoreCards ? html`
        <div style="text-align: center; margin-top: 20px;">
          <button class="btn btn-secondary" @click=${() => this._loadPage(false)} ?disabled=${isLoadingCards}
            style="padding: 8px 24px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-secondary);">
            ${isLoadingCards ? html`<span class="spinner"></span>` : 'Carregar mais'}
          </button>
        </div>
      ` : ''}

      ${flashcards.length === 0 && !isLoadingCards ? html`
        <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
          Nenhum flashcard encontrado.
        </div>
      ` : ''}
    `;
  }

  private _renderRow(card: Flashcard) {
    const isDeleted = card.isDeleted === true;
    return html`
      <tr style="
        border-bottom: 1px solid rgba(255,255,255,0.05);
        ${isDeleted ? 'opacity: 0.45;' : ''}
        transition: background 0.15s;
      "
        @mouseenter=${(e: MouseEvent) => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)')}
        @mouseleave=${(e: MouseEvent) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
      >
        <td style="padding: 12px 10px; max-width: 340px;">
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-primary);">
            ${sanitizeHtml(card.question)}
          </div>
        </td>
        <td style="padding: 12px 10px; color: var(--text-secondary);">${sanitizeHtml(card.category)}</td>
        <td style="padding: 12px 10px; color: var(--text-secondary); text-transform: capitalize;">${card.difficulty ?? '—'}</td>
        <td style="padding: 12px 10px;">
          ${isDeleted
            ? html`<span style="color: #ff5555; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px;">Deletado</span>`
            : card.isPublished
              ? html`<span style="color: #00ff66; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px;">Publicado</span>`
              : html`<span style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px;">Rascunho</span>`}
        </td>
        <td style="padding: 12px 10px;">
          <div style="display: flex; gap: 8px;">
            ${!isDeleted ? html`
              <button
                id="edit-card-${card.id}"
                @click=${() => adminActions.openEditEditor(card)}
                style="padding: 5px 12px; background: rgba(0,242,254,0.08); border: 1px solid var(--primary); color: var(--primary); border-radius: 4px; cursor: pointer; font-size: 0.78rem; font-family: 'Space Grotesk', sans-serif;">
                Editar
              </button>
              <button
                id="delete-card-${card.id}"
                @click=${() => this._handleDelete(card)}
                style="padding: 5px 12px; background: rgba(255,51,51,0.08); border: 1px solid #ff3333; color: #ff5555; border-radius: 4px; cursor: pointer; font-size: 0.78rem; font-family: 'Space Grotesk', sans-serif;">
                Deletar
              </button>
            ` : html`
              <button
                id="restore-card-${card.id}"
                @click=${() => this._handleRestore(card)}
                style="padding: 5px 12px; background: rgba(0,255,102,0.08); border: 1px solid #00ff66; color: #00ff66; border-radius: 4px; cursor: pointer; font-size: 0.78rem; font-family: 'Space Grotesk', sans-serif;">
                Restaurar
              </button>
            `}
          </div>
        </td>
      </tr>
    `;
  }

  private async _loadPage(reset: boolean) {
    const state = this._admin.value;
    useAdminStore.setState({ isLoadingCards: true });

    try {
      const cursor = reset ? undefined : state.lastVisibleCard ?? undefined;
      const { data, lastVisible, hasMore } = await adminGetFlashcardsPage(cursor ?? undefined);
      if (reset) {
        adminActions.setCards(data, lastVisible, hasMore);
      } else {
        adminActions.appendCards(data, lastVisible, hasMore);
      }
    } catch (err) {
      adminActions.setError(err instanceof Error ? sanitizeHtml(err.message) : 'Erro ao carregar cards');
    }
  }

  private async _handleDelete(card: Flashcard) {
    if (!card.id) return;
    if (!confirm(`Deletar card: "${card.question.substring(0, 60)}..."?`)) return;
    try {
      await adminSoftDeleteFlashcard(card.id);
      adminActions.removeCard(card.id);
    } catch (err) {
      adminActions.setError(err instanceof Error ? sanitizeHtml(err.message) : 'Erro ao deletar');
    }
  }

  private async _handleRestore(card: Flashcard) {
    if (!card.id) return;
    try {
      await adminRestoreFlashcard(card.id);
      // Optimistically mark as not deleted in the store
      adminActions.upsertCard({ ...card, isDeleted: false });
    } catch (err) {
      adminActions.setError(err instanceof Error ? sanitizeHtml(err.message) : 'Erro ao restaurar');
    }
  }

  static override styles = css``;
}

declare global {
  interface HTMLElementTagNameMap {
    'barcl-card-list': BarclCardList;
  }
}
