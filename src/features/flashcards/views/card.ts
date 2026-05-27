/**
 * <barcl-card>
 *
 * Displays a single flashcard — question + image on front,
 * answer + explanation on back. Subscribes to session store.
 *
 * Lit auto-escapes template interpolations — DOMPurify applied
 * as an extra layer when rendering content that came from Firestore.
 */

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { StoreController } from '@/shared/utils/lit-helpers';
import { useSessionStore, sessionSelectors } from '@/features/study-session/store';
import { sanitizeHtml } from '@/shared/utils/sanitizer';

@customElement('barcl-card')
export class BarclCard extends LitElement {
  override createRenderRoot() { return this; }

  private _session = new StoreController(this, useSessionStore);

  override render() {
    const state = this._session.value;
    const current = sessionSelectors.currentCard(state);

    if (state.error) {
      return html`
        <div class="pacs-panel" style="text-align: center; padding: 40px; color: var(--error-color, #ff5555);">
          <p>${sanitizeHtml(state.error)}</p>
        </div>
      `;
    }

    if (sessionSelectors.isComplete(state)) {
      return this._renderComplete(state.stats);
    }

    if (!current) {
      return html`
        <div class="pacs-panel" style="text-align: center; padding: 40px;">
          <div class="loader"></div>
          <p style="color: var(--text-secondary); margin-top: 16px;">Carregando sessão...</p>
        </div>
      `;
    }

    const { card } = current;

    return html`
      <div class="pacs-card glassmorphism" id="current-flashcard" style="
        position: relative;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        overflow: hidden;
        transition: border-color 0.2s ease;
      ">
        <!-- Card Counter -->
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          border-bottom: 1px solid var(--border-color);
          background: rgba(0,0,0,0.2);
        ">
          <span style="font-family: 'Space Grotesk', monospace; font-size: 0.8rem; color: var(--text-secondary); letter-spacing: 1px; text-transform: uppercase;">
            ${card.category}${card.subcategory ? ` · ${card.subcategory}` : ''}
          </span>
          <span style="font-size: 0.8rem; color: var(--text-secondary);">
            ${state.stats.reviewed + 1} / ${state.pool.length}
          </span>
        </div>

        <!-- Image (if present) -->
        ${card.imageUrl ? html`
          <div class="card-image-container" style="
            position: relative;
            background: #000;
            max-height: 400px;
            overflow: hidden;
            cursor: zoom-in;
          " @click=${() => this._openLightbox(card.imageUrl!)}>
            <img
              src="${card.imageUrl}"
              alt="Imagem diagnóstica"
              loading="lazy"
              style="width: 100%; height: 100%; object-fit: contain; display: block; transition: opacity 0.3s ease;"
              @error=${(e: Event) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            >
            <div style="
              position: absolute; bottom: 8px; right: 8px;
              background: rgba(0,0,0,0.7); border-radius: 4px; padding: 4px 8px;
              font-size: 0.75rem; color: var(--text-secondary);
            ">
              🔍 Ampliar
            </div>
          </div>
        ` : ''}

        <!-- Question -->
        <div class="prompt-section" style="padding: 24px;">
          <div class="prompt-badge" style="
            font-size: 1.05rem;
            line-height: 1.6;
            color: var(--text-primary);
          ">
            ${sanitizeHtml(card.question)}
          </div>
        </div>

        <!-- Answer (shown after reveal) -->
        ${state.isAnswerRevealed ? html`
          <div class="answer-section" style="
            border-top: 1px dashed var(--border-color);
            padding: 24px;
            background: rgba(0, 242, 254, 0.03);
          ">
            <div class="report-box" style="
              font-family: 'Space Grotesk', sans-serif;
              font-size: 1rem;
              line-height: 1.6;
              color: var(--primary);
            ">
              ${sanitizeHtml(card.answer)}
            </div>

            ${card.explanation ? html`
              <div style="
                margin-top: 16px;
                padding: 14px;
                border: 1px solid rgba(255,255,255,0.06);
                border-radius: 4px;
                background: rgba(0,0,0,0.3);
                font-size: 0.9rem;
                color: var(--text-secondary);
                line-height: 1.5;
              ">
                <strong style="display: block; margin-bottom: 6px; color: var(--text-primary); text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px;">Explicação</strong>
                ${sanitizeHtml(card.explanation)}
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  private _renderComplete(stats: { total: number; reviewed: number; correct: number; wrong: number }) {
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return html`
      <div class="pacs-panel glassmorphism" style="text-align: center; padding: 50px 30px;">
        <div style="font-size: 3rem; margin-bottom: 20px;">
          ${pct >= 80 ? '🎯' : pct >= 50 ? '📈' : '💪'}
        </div>
        <h2 style="font-family: 'Space Grotesk', sans-serif; margin-bottom: 8px;">Sessão Completa</h2>
        <p style="color: var(--text-secondary); margin-bottom: 30px;">${stats.reviewed} cards revisados</p>
        <div style="display: flex; justify-content: center; gap: 30px; margin-bottom: 30px;">
          <div>
            <div style="font-size: 2rem; font-weight: 700; color: #00ff66;">${stats.correct}</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase;">Corretos</div>
          </div>
          <div>
            <div style="font-size: 2rem; font-weight: 700; color: #ff5555;">${stats.wrong}</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase;">Erros</div>
          </div>
          <div>
            <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">${pct}%</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase;">Acertos</div>
          </div>
        </div>
        <button class="btn btn-primary" @click=${() => window.location.reload()}>
          Nova Sessão
        </button>
      </div>
    `;
  }

  private _openLightbox(url: string) {
    this.dispatchEvent(new CustomEvent('open-lightbox', {
      detail: { url },
      bubbles: true,
      composed: true,
    }));
  }

  static override styles = css``;
}

declare global {
  interface HTMLElementTagNameMap {
    'barcl-card': BarclCard;
  }
}
