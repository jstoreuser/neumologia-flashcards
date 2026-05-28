/**
 * <barcl-deck>
 *
 * Root study UI component. Composes:
 * - <barcl-session-bar>  — progress bar + stats
 * - <barcl-card>         — current card display
 * - <barcl-rating-buttons> — reveal + SM-2 rating buttons
 *
 * Handles cross-component events:
 * - card-rated  → calls session.service.submitRating()
 * - open-lightbox → opens the image lightbox
 *
 * User is injected via property; set by main.ts after auth resolves.
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { User } from 'firebase/auth';
import { submitRating } from '@/features/study-session/session.service';
import type { Rating } from '@/features/study-session/domain/sm2';

import { useSessionStore, sessionSelectors, sessionActions } from '@/features/study-session/store';
import { StoreController } from '@/shared/utils/lit-helpers';
import './card';
import '@/features/study-session/views/rating-buttons';
import '@/features/study-session/views/session-bar';

@customElement('barcl-deck')
export class BarclDeck extends LitElement {
  override createRenderRoot() { return this; }

  @property({ attribute: false })
  user: User | null = null;

  private _session = new StoreController(this, useSessionStore);
  private _tickInterval = 0;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('card-rated', this._handleCardRated);
    this.addEventListener('open-lightbox', this._handleOpenLightbox);
    this._tickInterval = window.setInterval(() => {
      sessionActions.tick();
    }, 5000) as unknown as number;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('card-rated', this._handleCardRated);
    this.removeEventListener('open-lightbox', this._handleOpenLightbox);
    if (this._tickInterval) clearInterval(this._tickInterval);
  }

  override render() {
    const state = this._session.value;
    const isComplete = sessionSelectors.isComplete(state);
    const isWaiting = sessionSelectors.isWaiting(state);

    return html`
      <div id="study-workspace" style="display: flex; flex-direction: column; width: 100%; max-width: 760px; margin: 0 auto;">
        <barcl-session-bar></barcl-session-bar>

        ${isComplete ? html`
          <!-- All cards mastered — barcl-card renders the completion screen -->
          <barcl-card></barcl-card>
        ` : isWaiting ? html`
          <div style="padding: 40px; text-align: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; margin-top: 20px;">
            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Revisión Pausada</h3>
            <p style="color: var(--text-secondary);">No hay flashcards pendientes en este momento. Algunos reaparecerán pronto de acuerdo a su tiempo de repetición.</p>
            <div style="margin-top: 20px; font-size: 0.85rem; color: var(--primary);">Esperando nuevos cards...</div>
          </div>
        ` : html`
          <barcl-card></barcl-card>
          <barcl-rating-buttons></barcl-rating-buttons>
        `}
      </div>
    `;
  }

  // Use arrow fields so 'this' is preserved in event listeners
  private _handleCardRated = async (e: Event) => {
    if (!this.user) return;
    const rating = (e as CustomEvent<{ rating: Rating }>).detail?.rating;
    if (rating) await submitRating(this.user, rating);
  };

  private _handleOpenLightbox = (e: Event) => {
    const url = (e as CustomEvent<{ url: string }>).detail?.url;
    if (!url) return;
    this.dispatchEvent(new CustomEvent('open-lightbox', {
      detail: { url },
      bubbles: true,
      composed: true,
    }));
  };

  static override styles = css``;
}

declare global {
  interface HTMLElementTagNameMap {
    'barcl-deck': BarclDeck;
  }
}


