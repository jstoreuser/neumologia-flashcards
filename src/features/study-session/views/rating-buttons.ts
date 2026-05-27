/**
 * <barcl-rating-buttons>
 *
 * Shows either the "Ver Respuesta" button (pre-reveal)
 * or the 4 SM-2 rating buttons with interval previews (post-reveal).
 *
 * Dispatches rating events upward — no direct service calls here.
 */

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
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
            class="btn btn-primary btn-large aesthetic-reveal-btn"
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
    
    // Sleek minimalist colors
    const ratings: { rating: Rating; label: string; color: string; id: string }[] = [
      { rating: 'wrong', label: 'Errei', color: '#ff4d4f', id: 'rate-wrong-btn' },
      { rating: 'hard', label: 'Difícil', color: '#faad14', id: 'rate-hard-btn' },
      { rating: 'good', label: 'Correto', color: '#1677ff', id: 'rate-good-btn' },
      { rating: 'easy', label: 'Fácil', color: '#52c41a', id: 'rate-easy-btn' },
    ];

    return html`
      <style>
        .aesthetic-rating-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          padding: 24px 0 10px;
        }
        
        .aesthetic-rating-btn {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 16px 8px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
          color: var(--text-primary);
          font-family: 'Space Grotesk', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .aesthetic-rating-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--btn-color);
          opacity: 0.5;
          transition: opacity 0.2s ease, height 0.2s ease;
        }

        .aesthetic-rating-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .aesthetic-rating-btn:hover::before {
          opacity: 1;
          height: 3px;
        }

        .aesthetic-rating-btn:active {
          transform: translateY(0);
        }

        .aesthetic-rating-label {
          font-weight: 500;
          font-size: 0.95rem;
          letter-spacing: 0.3px;
        }

        .aesthetic-rating-preview {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 400;
        }

        .aesthetic-reveal-btn {
          min-width: 240px;
          border-radius: 30px;
          padding: 14px 32px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          box-shadow: 0 4px 15px rgba(0, 242, 254, 0.2);
          transition: all 0.1s ease;
        }
        
        .aesthetic-reveal-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 242, 254, 0.3);
        }
      </style>

      <div class="aesthetic-rating-grid">
        ${ratings.map(({ rating, label, color, id }) => {
          const preview = previewInterval(progress, rating);
          return html`
            <button
              id="${id}"
              class="aesthetic-rating-btn"
              style="--btn-color: ${color};"
              @click=${() => this._handleRate(rating)}
              ?disabled=${state.isSubmitting}
            >
              <span class="aesthetic-rating-label" style="color: ${color}">${label}</span>
              <span class="aesthetic-rating-preview">${preview}</span>
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
    this.dispatchEvent(new CustomEvent<{ rating: Rating }>('card-rated', {
      detail: { rating },
      bubbles: true,
      composed: true,
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'barcl-rating-buttons': BarclRatingButtons;
  }
}
