/**
 * <barcl-lightbox>
 *
 * Full-screen image viewer. Mounted into document.body once on boot.
 * Listens for 'open-lightbox' events bubbling from anywhere in the tree.
 *
 * - Click backdrop to close
 * - Press Escape to close
 * - Keyboard accessible (close button is focusable)
 */

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('barcl-lightbox')
export class BarclLightbox extends LitElement {
  override createRenderRoot() { return this; }

  @state() private _open = false;
  @state() private _url = '';

  override connectedCallback() {
    super.connectedCallback();
    this._handleOpen = this._handleOpen.bind(this);
    this._handleKeydown = this._handleKeydown.bind(this);
    document.addEventListener('open-lightbox', this._handleOpen as EventListener);
    document.addEventListener('keydown', this._handleKeydown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('open-lightbox', this._handleOpen as EventListener);
    document.removeEventListener('keydown', this._handleKeydown);
  }

  override render() {
    if (!this._open) return html``;

    return html`
      <div
        class="barcl-lightbox-backdrop"
        role="dialog"
        aria-modal="true"
        aria-label="Imagem ampliada"
        @click=${this._close}
      >
        <button
          class="barcl-lightbox-close"
          aria-label="Fechar"
          @click=${this._close}
        >×</button>
        <img
          class="barcl-lightbox-img"
          src="${this._url}"
          alt="Imagem diagnóstica ampliada"
          @click=${(e: Event) => e.stopPropagation()}
        >
      </div>
    `;
  }

  private _handleOpen = (e: Event) => {
    const url = (e as CustomEvent<{ url: string }>).detail?.url;
    if (url) {
      this._url = url;
      this._open = true;
      document.body.style.overflow = 'hidden';
    }
  };

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this._open) this._close();
  };

  private _close() {
    this._open = false;
    this._url = '';
    document.body.style.overflow = '';
  }

  static override styles = css``;
}

declare global {
  interface HTMLElementTagNameMap {
    'barcl-lightbox': BarclLightbox;
  }
}
