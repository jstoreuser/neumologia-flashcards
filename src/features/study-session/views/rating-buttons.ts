/**
 * <barcl-rating-buttons>
 *
 * Shows either the "Ver Respuesta" button (pre-reveal)
 * or the 4 SM-2 rating buttons with interval previews (post-reveal).
 *
 * Dispatches rating events upward — no direct service calls here.
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { StoreController } from '@/shared/utils/lit-helpers';
import { useSessionStore, sessionActions, sessionSelectors } from '@/features/study-session/store';
import { previewInterval, type Rating } from '@/features/study-session/domain/sm2';

@customElement('barcl-rating-buttons')
export class BarclRatingButtons extends LitElement {
  override createRenderRoot() { return this; }

  private _session = new StoreController(this, useSessionStore);

  override render() {
    const state = this._session.value;
    const current = sessionSelectors.currentCard(state);

    if (!current || sessionSelectors.isComplete(state)) {
      return html``;
    }

    if (!state.isAnswerRevealed) {
      return html`
        <div class="card-action-bar" style="display: flex; justify-content: center; padding: 20px 0;">
          <button
            id="reveal-answer-btn"
            class="btn btn-primary btn-large"
            style="min-width: 200px;"
            @click=${this._handleReveal}
            ?disabled=${state.isSubmitting}
          >
            Ver Respuesta
          </button>
        </div>
      `;
    }

    // Post-reveal: show SM-2 rating buttons with interval previews
    const { progress } = current;
    const ratings: { rating: Rating; label: string; style: string; id: string }[] = [
      {
        rating: 'wrong',
        label: 'Erré',
        style: 'background: rgba(255,51,51,0.15); border: 1px solid #ff3333; color: #ff5555;',
        id: 'rate-wrong-btn',
      },
      {
        rating: 'hard',
        label: 'Difícil',
        style: 'background: rgba(255,165,0,0.15); border: 1px solid #ff8c00; color: #ffa500;',
        id: 'rate-hard-btn',
      },
      {
        rating: 'good',
        label: 'Correto',
        style: 'background: rgba(0,242,254,0.1); border: 1px solid var(--primary); color: var(--primary);',
        id: 'rate-good-btn',
      },
      {
        rating: 'easy',
        label: 'Fácil',
        style: 'background: rgba(0,255,102,0.1); border: 1px solid #00ff66; color: #00ff66;',
        id: 'rate-easy-btn',
      },
    ];

    return html`
      <div class="card-action-bar" style="
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        padding: 20px 0;
      ">
        ${ratings.map(({ rating, label, style, id }) => {
          const preview = previewInterval(progress, rating);
          return html`
            <button
              id="${id}"
              class="btn"
              style="${style} display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px 8px; border-radius: 4px; cursor: pointer; transition: all 0.15s ease; font-family: 'Plus Jakarta Sans', sans-serif;"
              @click=${() => this._handleRate(rating)}
              ?disabled=${state.isSubmitting}
            >
              <span style="font-weight: 600; font-size: 0.9rem;">${label}</span>
              <span style="font-size: 0.75rem; opacity: 0.7;">${preview}</span>
            </button>
          `;
        })}
      </div>
    `;
  }

  private _handleReveal() {
    sessionActions.revealAnswer();
  }

  private _handleRate(rating: Rating) {
    // Dispatch upward so the parent (deck component or main.ts) can call session.service
    this.dispatchEvent(new CustomEvent<{ rating: Rating }>('card-rated', {
      detail: { rating },
      bubbles: true,
      composed: true,
    }));
  }

  static override styles = css``;
}

declare global {
  interface HTMLElementTagNameMap {
    'barcl-rating-buttons': BarclRatingButtons;
  }
}
