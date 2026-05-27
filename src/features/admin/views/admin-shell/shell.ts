import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { StoreController } from '@/shared/utils/lit-helpers';
import { useAdminStore } from '../../store';
import { fetchFlashcards, fetchUsers } from '../../admin.actions';

import './sidebar';
import './topbar';
import './pane-router';
import '../card-editor';

@customElement('barcl-admin-shell')
export class BarclAdminShell extends LitElement {
  override createRenderRoot() { return this; }
  private _admin = new StoreController(this, useAdminStore);

  override connectedCallback() {
    super.connectedCallback();
    // Start fetching data based on active view
    if (this._admin.value.activeView === 'flashcards') {
      fetchFlashcards();
    } else {
      fetchUsers();
    }
  }

  override render() {
    return html`
      <div style="display: flex; height: 100vh; overflow: hidden; background: #050505;">
        <barcl-admin-sidebar></barcl-admin-sidebar>
        
        <main style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
          <barcl-admin-topbar></barcl-admin-topbar>
          <div style="flex: 1; overflow-y: auto; padding: 24px;">
            <barcl-admin-pane-router></barcl-admin-pane-router>
          </div>
        </main>
        
        <barcl-card-editor></barcl-card-editor>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'barcl-admin-shell': BarclAdminShell;
  }
}
