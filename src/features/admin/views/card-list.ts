/**
 * <barcl-card-list>
 *
 * Admin table of all flashcards. Uses purely reactive state.
 */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { StoreController } from '@/shared/utils/lit-helpers';
import { useAdminStore, adminActions, type CardSortField } from '../store';
import { fetchFlashcards, toggleFlashcardDelete } from '../admin.actions';
import { selectFlashcardsList, selectHasPendingOperation } from '../selectors';
import { sanitizeHtml } from '@/shared/utils/sanitizer';
import type { Flashcard } from '@shared/contracts';

@customElement('barcl-card-list')
export class BarclCardList extends LitElement {
  override createRenderRoot() { return this; }

  private _admin = new StoreController(this, useAdminStore);

  private _sortHeader(label: string, field: CardSortField, state: ReturnType<typeof useAdminStore.getState>) {
    const active = state.cardSortField === field;
    const icon = active ? (state.cardSortDir === 'asc' ? ' ▲' : ' ▼') : ' ⇅';
    return html`
      <th
        @click=${() => adminActions.setCardSort(field)}
        style="
          padding: 16px;
          color: ${active ? 'var(--primary)' : 'var(--text-secondary)'};
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
          transition: color 0.15s;
        "
      >${label}<span style="opacity: ${active ? '1' : '0.4'}; font-size: 0.75em;">${icon}</span></th>
    `;
  }

  override render() {
    const state = this._admin.value;
    const flashcards = selectFlashcardsList(state);
    const { flashcardsStatus, flashcardsError, hasMoreCards } = state;

    if (flashcardsStatus === 'idle' || flashcardsStatus === 'loading') {
      return html`
        <div style="text-align: center; padding: 60px; color: var(--text-secondary);">
          <span class="spinner" style="border-color: var(--primary); border-right-color: transparent;"></span>
          <div style="margin-top: 16px; font-family: 'Space Grotesk', sans-serif;">Carregando flashcards...</div>
        </div>
      `;
    }

    if (flashcardsStatus === 'error' && flashcards.length === 0) {
      return html`
        <div style="text-align: center; padding: 60px; color: #ff5555; background: rgba(255,51,51,0.05); border: 1px solid rgba(255,51,51,0.2); border-radius: 8px;">
          <h3 style="margin: 0 0 8px 0;">Erro ao Carregar</h3>
          <p style="margin: 0; opacity: 0.8;">${sanitizeHtml(flashcardsError ?? 'Unknown error')}</p>
          <button @click=${() => fetchFlashcards(true)} class="btn secondary" style="margin-top: 16px;">Tentar Novamente</button>
        </div>
      `;
    }

    return html`
      ${flashcardsStatus === 'error' ? html`
        <div class="auth-error-banner" role="alert" style="margin-bottom: 16px;">${sanitizeHtml(flashcardsError ?? '')}</div>
      ` : ''}

      <div style="overflow-x: auto; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px;">
        <table style="width: 100%; border-collapse: collapse; font-family: 'Space Grotesk', sans-serif; font-size: 0.85rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); text-align: left; background: rgba(255,255,255,0.03);">
              ${this._sortHeader('ID', 'id', state)}
              ${this._sortHeader('Pergunta', 'createdAt', state)}
              ${this._sortHeader('Categoria', 'category', state)}
              <th style="padding: 16px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;">Status</th>
              <th style="padding: 16px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${flashcards.map(card => this._renderRow(card, state))}
          </tbody>
        </table>
      </div>

      ${flashcards.length === 0 && flashcardsStatus !== 'refreshing' ? html`
        <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
          Nenhum flashcard encontrado no banco de dados.
        </div>
      ` : ''}

      ${hasMoreCards ? html`
        <div style="text-align: center; margin-top: 24px;">
          <button class="btn btn-secondary" @click=${() => fetchFlashcards(false)} ?disabled=${flashcardsStatus === 'refreshing'}
            style="padding: 10px 32px; font-family: 'Space Grotesk', sans-serif;">
            ${flashcardsStatus === 'refreshing' ? html`<span class="spinner"></span>` : 'Carregar mais'}
          </button>
        </div>
      ` : ''}
    `;
  }

  private _renderRow(card: Flashcard, state: ReturnType<typeof useAdminStore.getState>) {
    const isDeleted = card.isDeleted === true;
    const cardId = card.id ?? '';
    const isPending = cardId ? selectHasPendingOperation(state, cardId) : false;

    return html`
      <tr style="
        border-bottom: 1px solid rgba(255,255,255,0.03);
        ${isDeleted ? 'opacity: 0.45;' : ''}
        ${isPending ? 'opacity: 0.7; pointer-events: none;' : ''}
        transition: all 0.2s;
      "
        @mouseenter=${(e: MouseEvent) => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)')}
        @mouseleave=${(e: MouseEvent) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
      >
        <td style="padding: 16px; color: var(--text-secondary); font-family: 'Space Grotesk', monospace; font-size: 0.8rem;">
          ${cardId ? html`<span title="${cardId}">${cardId.substring(0, 8)}...</span>` : 'N/A'}
        </td>
        <td style="padding: 16px; max-width: 340px;">
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-primary);">
            ${sanitizeHtml(card.question ?? '')}
          </div>
          ${isPending ? html`<span class="spinner" style="width: 12px; height: 12px; border-width: 2px; margin-top: 4px;"></span>` : ''}
        </td>
        <td style="padding: 16px; color: var(--text-secondary);">${sanitizeHtml(card.category ?? '')}</td>
        <td style="padding: 16px;">
          ${isDeleted
            ? html`<span style="color: #ff5555; background: rgba(255,51,51,0.1); padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px;">Deletado</span>`
            : card.isPublished
              ? html`<span style="color: #00ff66; background: rgba(0,255,102,0.1); padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px;">Publicado</span>`
              : html`<span style="color: var(--text-secondary); background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px;">Rascunho</span>`}
        </td>
        <td style="padding: 16px; text-align: right;">
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            ${!isDeleted && cardId ? html`
              <button
                @click=${() => adminActions.openEditEditor(cardId)}
                style="padding: 6px 14px; background: rgba(0,242,254,0.08); border: 1px solid var(--primary); color: var(--primary); border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-family: 'Space Grotesk', sans-serif; transition: all 0.2s;"
              >
                Editar
              </button>
            ` : ''}
            <button
              @click=${() => toggleFlashcardDelete(card)}
              style="padding: 6px 14px; background: ${isDeleted ? 'rgba(0,255,102,0.08)' : 'rgba(255,51,51,0.08)'}; border: 1px solid ${isDeleted ? '#00ff66' : '#ff3333'}; color: ${isDeleted ? '#00ff66' : '#ff5555'}; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-family: 'Space Grotesk', sans-serif; transition: all 0.2s;">
              ${isDeleted ? 'Restaurar' : 'Deletar'}
            </button>
          </div>
        </td>
      </tr>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'barcl-card-list': BarclCardList;
  }
}
