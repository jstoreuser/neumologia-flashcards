import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useLayoutStore, layoutActions } from '../layout.store';

import './progress-panel';
import './filter-panel';

@customElement('barcl-study-drawer')
export class StudyDrawer extends LitElement {
  @state() private isOpen = false;

  private unsubscribe?: () => void;



  override connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = useLayoutStore.subscribe((state: any) => {
      if (this.isOpen !== state.isDrawerOpen) {
        this.isOpen = state.isDrawerOpen;
        this.handleStateChange();
      }
    });
    window.addEventListener('keydown', this.handleKeyDown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
    window.removeEventListener('keydown', this.handleKeyDown);
    document.body.style.overflow = '';
  }

  // Disable shadow DOM so global CSS applies to children
  protected override createRenderRoot() {
    return this;
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.isOpen) {
      layoutActions.closeDrawer();
    }
  };

  private handleStateChange() {
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        const closeBtn = this.querySelector('.btn-close') as HTMLElement;
        closeBtn?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
    }
  }

  override render() {
    return html`
      <div class="drawer-backdrop ${this.isOpen ? 'open' : ''}" @click=${layoutActions.closeDrawer}></div>
      <div class="drawer-container ${this.isOpen ? 'open' : ''}" role="dialog" aria-modal="true">
        <div class="drawer-header">
          <div class="drawer-title">DASHBOARD</div>
          <button class="btn-close" aria-label="Cerrar" @click=${layoutActions.closeDrawer}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <barcl-progress-panel></barcl-progress-panel>
        <barcl-filter-panel></barcl-filter-panel>
      </div>
    `;
  }
}
