import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useSessionStore } from '../store';

@customElement('barcl-progress-panel')
export class ProgressPanel extends LitElement {
  @state() private percent = 0;
  @state() private mastered = 0;
  @state() private learning = 0;
  @state() private newCards = 0;
  @state() private streak = 0;

  private unsubscribe?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = useSessionStore.subscribe((state: any) => {
      const total = state.stats.total;
      const reviewed = state.stats.reviewed;
      this.percent = total === 0 ? 0 : Math.round((reviewed / total) * 100);
      
      let m = 0;
      let l = 0;
      let n = 0;
      for (const item of state.pool) {
        if (!item.progress) {
          n++;
        } else if (item.progress.easeFactor > 2.5 && item.progress.intervalDays > 3) {
          m++;
        } else {
          l++;
        }
      }
      this.mastered = m;
      this.learning = l;
      this.newCards = n;
      // Simulate streak for now if not in state
      this.streak = 0;
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  // Disable shadow DOM so it inherits global styles
  protected override createRenderRoot() {
    return this;
  }

  override render() {
    return html`
      <div class="pacs-panel">
          <div class="panel-header">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="panel-icon"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              <h2>Progreso</h2>
          </div>
          
          <div class="progress-radial-container">
              <svg class="progress-radial" viewBox="0 0 36 36">
                  <path class="radial-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path id="radial-progress-bar" class="radial-progress" stroke-dasharray="${this.percent}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div class="progress-radial-text">
                  <span class="radial-percent" id="radial-percent-lbl">${this.percent}%</span>
                  <span class="radial-sub">COMPLETADO</span>
              </div>
          </div>

          <div class="progress-stats-list">
              <div class="stat-item">
                  <div class="stat-item-lbl">
                      <span class="dot dot-mastered"></span>
                      Fáciles (Fijado)
                  </div>
                  <span class="stat-item-val">${this.mastered}</span>
              </div>
              <div class="stat-item">
                  <div class="stat-item-lbl">
                      <span class="dot dot-learning"></span>
                      Difíciles (Repasar)
                  </div>
                  <span class="stat-item-val">${this.learning}</span>
              </div>
              <div class="stat-item">
                  <div class="stat-item-lbl">
                      <span class="dot dot-new"></span>
                      Nuevos
                  </div>
                  <span class="stat-item-val">${this.newCards}</span>
              </div>
          </div>

          <div class="streak-banner">
              <div class="streak-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon-mini text-orange"><path d="M12 2c1.78 2.37 3 5.37 3 8s-1.22 5.63-3 8-3-5.37-3-8 1.22-5.63 3-8zm0 0c2-2 6 2 6 6s-4 6-6 6-6-2-6-6 4-8 6-8z"></path></svg>
              </div>
              <div class="streak-text">
                  <div class="streak-title"><span id="streak-count">${this.streak}</span> días seguidos</div>
                  <div class="streak-sub">Mantenga la frecuencia de estudio</div>
              </div>
          </div>
      </div>
    `;
  }
}
