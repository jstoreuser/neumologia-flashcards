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

// Register child components
import './card';
import '@/features/study-session/views/rating-buttons';
import '@/features/study-session/views/session-bar';

@customElement('barcl-deck')
export class BarclDeck extends LitElement {
  override createRenderRoot() { return this; }

  @property({ attribute: false })
  user: User | null = null;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('card-rated', this._handleCardRated);
    this.addEventListener('open-lightbox', this._handleOpenLightbox);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('card-rated', this._handleCardRated);
    this.removeEventListener('open-lightbox', this._handleOpenLightbox);
  }

  override render() {
    return html`
      <div id="study-workspace" style="display: flex; flex-direction: column; width: 100%; max-width: 760px; margin: 0 auto;">
        <barcl-session-bar></barcl-session-bar>
        <barcl-card></barcl-card>
        <barcl-rating-buttons></barcl-rating-buttons>
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


