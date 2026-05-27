import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { StoreController } from '@/shared/utils/lit-helpers';
import { useAdminStore } from '../../store';

import '../card-list';
import '../user-list';

@customElement('barcl-admin-pane-router')
export class BarclAdminPaneRouter extends LitElement {
  override createRenderRoot() { return this; }
  private _admin = new StoreController(this, useAdminStore);

  override render() {
    const { activeView } = this._admin.value;

    return html`
      <div style="max-width: 1200px; margin: 0 auto; height: 100%;">
        ${activeView === 'flashcards' 
          ? html`<barcl-card-list></barcl-card-list>`
          : html`<barcl-user-list></barcl-user-list>`
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'barcl-admin-pane-router': BarclAdminPaneRouter;
  }
}
