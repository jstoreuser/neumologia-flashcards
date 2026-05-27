import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useLayoutStore, layoutActions } from '../layout.store';

import './progress-panel';
import './filter-panel';

@customElement('barcl-study-drawer')
export class StudyDrawer extends LitElement {
  @state() private isOpen = false;

  private unsubscribe?: () => void;

  static styles = css`
    :host {
      display: block;
    }
    
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 199;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    
    .drawer-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }

    .drawer-container {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 340px;
      max-width: 85vw; /* Responsive for mobile */
      background-color: var(--bg-primary, #04060b);
      z-index: 200;
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      box-shadow: 20px 0 50px rgba(0, 0, 0, 0.5);
      border-right: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      padding: max(24px, env(safe-area-inset-top)) 24px max(24px, env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left));
      overflow-y: auto;
      gap: 24px;
    }

    .drawer-container.open {
      transform: translateX(0);
    }
    
    .drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .drawer-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary, #fff);
      font-family: var(--font-mono, monospace);
      letter-spacing: 0.05em;
    }
    
    .btn-close {
      background: transparent;
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      color: var(--text-secondary, #aaa);
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-close:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = useLayoutStore.subscribe((state) => {
      if (this.isOpen !== state.isDrawerOpen) {
        this.isOpen = state.isDrawerOpen;
        this.handleStateChange();
      }
    });
    window.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
    window.removeEventListener('keydown', this.handleKeyDown);
    document.body.style.overflow = '';
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
        const closeBtn = this.shadowRoot?.querySelector('.btn-close') as HTMLElement;
        closeBtn?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
    }
  }

  render() {
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
