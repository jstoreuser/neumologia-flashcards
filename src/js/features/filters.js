// ==========================================================================
// BARCL Category Filters controller (UI Feature Component)
// ==========================================================================
import { EventBus } from "../core/event-bus.js";

export const Filters = {
    containerEl: null,

    /**
     * Inicializa a escuta de cliques nas pills de filtragem de imagens médicas.
     */
    init() {
        this.containerEl = document.getElementById("filter-container");
        
        if (this.containerEl) {
            this.containerEl.addEventListener("click", (e) => {
                const pill = e.target.closest(".filter-pill");
                if (!pill) return;

                this.setActivePill(pill);
                const selectedFilter = pill.getAttribute("data-filter");
                
                // Comunica a alteração de filtro
                EventBus.emit("filter:changed", selectedFilter);
            });
        }
    },

    /**
     * Alterna a classe de destaque da pill ativa no menu lateral.
     */
    setActivePill(activePill) {
        if (!this.containerEl) return;
        
        this.containerEl.querySelectorAll(".filter-pill").forEach(el => {
            el.classList.remove("active");
        });
        
        activePill.classList.add("active");
    }
};
