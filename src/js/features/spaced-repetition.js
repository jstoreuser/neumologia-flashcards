// ==========================================================================
// BARCL Spaced Repetition active recall Engine (Business Logic)
// ==========================================================================
import { Storage } from "../core/storage.js";
import { EventBus } from "../core/event-bus.js";

export const SpacedRepetition = {
    userProgress: {},

    /**
     * Inicializa carregando os estados armazenados em localStorage com segurança.
     */
    init() {
        this.userProgress = Storage.loadProgress();
        // Emite o estado inicial
        EventBus.emit("progress:loaded", this.userProgress);
    },

    /**
     * Calcula o spaced repetition e salva de forma persistente.
     * Retorna a ação a ser tomada na fila (next, hard, wrong).
     */
    rateCard(card, rating) {
        if (!card) return null;

        // Se for o primeiro estudo desse card específico
        if (!this.userProgress[card.id]) {
            this.userProgress[card.id] = {
                status: "new",
                easeCount: 0,
                reviewsCount: 0
            };
        }

        const state = this.userProgress[card.id];
        state.reviewsCount++;

        let action = "next"; // Ação de avanço ou reinserção na fila

        if (rating === "easy") {
            state.status = "mastered";
            state.easeCount++;
            action = "next";
        } else if (rating === "hard") {
            state.status = "learning";
            action = "hard"; // Re-inserir 5 posições à frente
        } else if (rating === "wrong") {
            state.status = "learning";
            action = "wrong"; // Re-inserir 2 posições à frente
        }

        // Persiste o progresso
        Storage.saveProgress(this.userProgress);

        // Notifica o sistema de que o progresso foi modificado
        EventBus.emit("progress:changed", {
            progress: this.userProgress,
            ratedCard: card,
            rating: rating
        });

        return action;
    },

    /**
     * Reseta todo o progresso do usuário de forma global.
     */
    resetAll() {
        this.userProgress = {};
        Storage.clearAll();
        
        EventBus.emit("progress:reset", this.userProgress);
    }
};
