// ==========================================================================
// BARCL Clinical Metrics & Session Statistics Controller
// ==========================================================================
import { EventBus } from "../core/event-bus.js";

export const Statistics = {
    radialBar: null,
    radialPercent: null,
    statsMastered: null,
    statsLearning: null,
    statsNew: null,
    streakCount: null,
    queueCount: null,
    progressBarFill: null,

    /**
     * Liga referências DOM de contadores e roscas de progresso e ouve eventos do EventBus.
     */
    init() {
        this.radialBar = document.getElementById("radial-progress-bar");
        this.radialPercent = document.getElementById("radial-percent-lbl");
        this.statsMastered = document.getElementById("stats-mastered");
        this.statsLearning = document.getElementById("stats-learning");
        this.statsNew = document.getElementById("stats-new");
        this.streakCount = document.getElementById("streak-count");
        this.queueCount = document.getElementById("current-queue-count");
        this.progressBarFill = document.getElementById("session-progress-bar");

        // Assina as atualizações emitidas pelo EventBus
        EventBus.on("stats:update", (data) => this.updateOverviewStats(data));
        EventBus.on("queue:update", (data) => this.updateSessionQueue(data));
        EventBus.on("streak:update", (count) => this.updateStreak(count));
    },

    /**
     * Atualiza os contadores gerais do painel lateral (Obsidian Sidebar).
     */
    updateOverviewStats(data) {
        const { mastered, learning, newCount, masteredPercent, filterCounts } = data;

        if (this.statsMastered) this.statsMastered.textContent = mastered;
        if (this.statsLearning) this.statsLearning.textContent = learning;
        if (this.statsNew) this.statsNew.textContent = newCount;
        
        if (this.radialPercent) this.radialPercent.textContent = `${masteredPercent}%`;

        if (this.radialBar) {
            // A circunferência do SVG circular de raio 15.9155 é exatamente 100
            this.radialBar.setAttribute("stroke-dasharray", `${masteredPercent}, 100`);
        }

        // Atualiza os contadores menores contidos dentro de cada filter-pill
        if (filterCounts) {
            for (const tag in filterCounts) {
                const countLbl = document.getElementById(`count-${tag}`);
                if (countLbl) {
                    countLbl.textContent = filterCounts[tag];
                }
            }
        }
    },

    /**
     * Atualiza os contadores de cards restantes da sessão e a barra de progresso linear.
     */
    updateSessionQueue(data) {
        const { remaining, completedPercent } = data;
        
        if (this.queueCount) {
            this.queueCount.textContent = remaining >= 0 ? remaining : 0;
        }
        
        if (this.progressBarFill) {
            this.progressBarFill.style.width = `${completedPercent}%`;
        }
    },

    /**
     * Atualiza o banner de dias consecutivos de estudo ativo.
     */
    updateStreak(count) {
        if (this.streakCount) {
            this.streakCount.textContent = count;
        }
    }
};
