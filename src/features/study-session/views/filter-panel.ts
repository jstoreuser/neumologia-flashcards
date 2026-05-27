import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useFlashcardStore } from '@/features/flashcards/store';

@customElement('barcl-filter-panel')
export class FilterPanel extends LitElement {
  @state() private countTodos = 0;
  @state() private countRadiografia = 0;
  @state() private countTomografia = 0;
  @state() private countSignos = 0;
  @state() private countPatrones = 0;

  private unsubscribe?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = useFlashcardStore.subscribe((state) => {
      const cards = state.cards;
      this.countTodos = cards.length;
      
      const getCount = (cat: string) => cards.filter(c => c.category === cat || c.category?.toLowerCase() === cat.toLowerCase()).length;
      
      this.countRadiografia = getCount('Radiografía');
      this.countTomografia = getCount('Tomografía');
      this.countSignos = getCount('Signo_Radiológico');
      this.countPatrones = getCount('Patrón_Intersticial');
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  // Disable shadow DOM to inherit styles
  protected createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <div class="pacs-panel">
          <div class="panel-header">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="panel-icon"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              <h2>Filtros</h2>
          </div>
          <div class="filter-pills-container" id="filter-container">
              <button class="filter-pill active" data-filter="Todos">
                  <span>Todas las Tarjetas</span>
                  <span class="pill-count">${this.countTodos}</span>
              </button>
              <button class="filter-pill" data-filter="Radiografía">
                  <span>Radiografías (Rx)</span>
                  <span class="pill-count">${this.countRadiografia}</span>
              </button>
              <button class="filter-pill" data-filter="Tomografía">
                  <span>Tomografías (TC)</span>
                  <span class="pill-count">${this.countTomografia}</span>
              </button>
              <button class="filter-pill" data-filter="Signo_Radiológico">
                  <span>Signos Clínicos</span>
                  <span class="pill-count">${this.countSignos}</span>
              </button>
              <button class="filter-pill" data-filter="Patrón_Intersticial">
                  <span>Patrones Intersticiales</span>
                  <span class="pill-count">${this.countPatrones}</span>
              </button>
          </div>
      </div>
    `;
  }
}
