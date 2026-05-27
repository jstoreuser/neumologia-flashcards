/**
 * <barcl-session-bar>
 *
 * Progress bar + session stats strip shown above the card.
 * Updates reactively as the user rates cards.
 */

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { StoreController } from '@/shared/utils/lit-helpers';
import { useSessionStore, sessionSelectors } from '@/features/study-session/store';

@customElement('barcl-session-bar')
export class BarclSessionBar extends LitElement {
  override createRenderRoot() { return this; }

  private _session = new StoreController(this, useSessionStore);

  override render() {
    const state = this._session.value;
    const pct = sessionSelectors.progressPercent(state);
    const { stats } = state;

    if (state.queue.length === 0) return html``;

    return html`
      <div style="margin-bottom: 16px;">
        <!-- Progress bar -->
        <div style="
          height: 3px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 12px;
        ">
          <div style="
            height: 100%;
            width: ${pct}%;
            background: linear-gradient(90deg, var(--primary), #00ff88);
            border-radius: 2px;
            transition: width 0.4s ease;
          "></div>
        </div>

        <!-- Stats row -->
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.8rem;
        ">
          <span style="color: var(--text-secondary);">
            ${state.currentIndex} / ${stats.total}
          </span>
          <div style="display: flex; gap: 16px;">
            <span style="color: #00ff66;">✓ ${stats.correct}</span>
            <span style="color: #ff5555;">✗ ${stats.wrong}</span>
          </div>
          <span style="color: var(--text-secondary);">${pct}%</span>
        </div>
      </div>
    `;
  }

  static override styles = css``;
}

declare global {
  interface HTMLElementTagNameMap {
    'barcl-session-bar': BarclSessionBar;
  }
}
