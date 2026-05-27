import { useSessionStore } from './store';
import { useFlashcardStore } from '@/features/flashcards/store';

export function initSidebarController() {
  useSessionStore.subscribe((state) => {
    const total = state.stats.total;
    const reviewed = state.stats.reviewed;
    const percent = total === 0 ? 0 : Math.round((reviewed / total) * 100);
    
    const percentLbl = document.getElementById('radial-percent-lbl');
    if (percentLbl) percentLbl.textContent = `${percent}%`;

    const progressFill = document.getElementById('radial-progress-bar');
    if (progressFill) {
      progressFill.setAttribute('stroke-dasharray', `${percent}, 100`);
    }

    let mastered = 0;
    let learning = 0;
    let newCards = 0;
    
    for (const item of state.queue) {
      if (!item.progress) {
        newCards++;
      } else if (item.progress.easeFactor > 2.5 && item.progress.intervalDays > 3) {
        mastered++;
      } else {
        learning++;
      }
    }

    const mEl = document.getElementById('stats-mastered');
    if (mEl) mEl.textContent = mastered.toString();

    const lEl = document.getElementById('stats-learning');
    if (lEl) lEl.textContent = learning.toString();

    const nEl = document.getElementById('stats-new');
    if (nEl) nEl.textContent = newCards.toString();
  });

  useFlashcardStore.subscribe((state) => {
    const cards = state.cards;
    
    const countTodos = document.getElementById('count-Todos');
    if (countTodos) countTodos.textContent = cards.length.toString();

    const categories = ['Radiografía', 'Tomografía', 'Signo_Radiológico', 'Patrón_Intersticial'];
    for (const cat of categories) {
      const el = document.getElementById(`count-${cat}`);
      if (el) {
         // Fallback if category cases don't match, or they are mostly 'General' right now.
         const count = cards.filter(c => c.category === cat || c.category?.toLowerCase() === cat.toLowerCase()).length;
         el.textContent = count.toString();
      }
    }
  });
}
