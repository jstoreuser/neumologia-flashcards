// ==========================================================================
// BARCL Clinical Session State Controller (Workstation Business State)
// ==========================================================================
import { Storage } from "./storage.js";
import { EventBus } from "./event-bus.js";
import { Validator } from "./validator.js";
import { FLASHCARD_DATA } from "./data.js";

export const State = {
    activeQueue: [],
    currentCardIndex: 0,
    currentFilter: "Todos",
    sessionCount: 0,
    sessionSuccessCount: 0,
    streakState: { count: 0, lastDate: null },

    /**
     * Valida o dataset inteiro e inicializa escutas do barramento de eventos.
     */
    init() {
        // Auditoria defensiva de integridade de dados na inicialização
        try {
            Validator.validateDataset(FLASHCARD_DATA);
        } catch (err) {
            // Lança uma exceção física que o ErrorOverlay capturará
            throw new Error(`[Database Schema Failed] ${err.message}`);
        }

        this.streakState = Storage.loadStreak();
        EventBus.emit("streak:update", this.streakState.count);

        // Assina eventos de Spaced Repetition e reset do progresso
        EventBus.on("progress:changed", (data) => {
            this.handleCardRated(data.ratedCard, data.rating);
            this.emitStatsUpdate();
        });

        EventBus.on("progress:reset", () => {
            this.streakState = { count: 0, lastDate: null };
            Storage.saveStreak(this.streakState);
            EventBus.emit("streak:update", 0);
            this.initSession(this.currentFilter);
        });

        EventBus.on("filter:changed", (filter) => {
            this.initSession(filter);
        });
    },

    /**
     * Inicializa a fila de estudo inteligente priorizada baseada no progresso.
     */
    initSession(filter = "Todos") {
        this.currentFilter = filter;
        this.activeQueue = [];
        this.currentCardIndex = 0;
        this.sessionCount = 0;
        this.sessionSuccessCount = 0;

        const progress = Storage.loadProgress();

        // 1. Filtragem por categoria de estudo
        let filtered = [];
        if (filter === "Todos") {
            filtered = [...FLASHCARD_DATA];
        } else {
            filtered = FLASHCARD_DATA.filter(card => card.tags.includes(filter));
        }

        // 2. Fila Inteligente (Spaced Repetition Priority Queuing):
        //    a. learning (cartões errados recentemente) - prioridade máxima
        //    b. new (cartões novos ainda não estudados)
        //    c. mastered (cartões dominados)
        const learning = [];
        const newQueue = [];
        const mastered = [];

        filtered.forEach(card => {
            const state = progress[card.id];
            if (!state || state.status === "new") {
                newQueue.push(card);
            } else if (state.status === "learning") {
                learning.push(card);
            } else if (state.status === "mastered") {
                mastered.push(card);
            }
        });

        // 3. Embaralhamento Fisher-Yates por prioridade (estudo dinâmico)
        this.shuffle(learning);
        this.shuffle(newQueue);
        this.shuffle(mastered);

        this.activeQueue = [...learning, ...newQueue, ...mastered];

        this.emitStatsUpdate();

        if (this.activeQueue.length === 0) {
            EventBus.emit("session:completed", { sessionCount: 0, sessionSuccessCount: 0 });
            return;
        }

        // 4. Carrega o primeiro exame clínico da fila
        EventBus.emit("card:load", this.activeQueue[0]);
        this.emitQueueUpdate();
    },

    /**
     * Algoritmo Fisher-Yates
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    },

    /**
     * Processa o avanço ou a reinserção do card com base na avaliação recebida.
     */
    handleCardRated(card, rating) {
        this.sessionCount++;

        const progress = Storage.loadProgress();
        const cardState = progress[card.id];

        // Atualização da streak diária
        this.updateStreak();

        if (rating === "easy") {
            if (cardState && cardState.reviewsCount === 1) {
                this.sessionSuccessCount++;
            }
            this.currentCardIndex++;
        } else if (rating === "hard") {
            // Re-insere 5 posições à frente na fila ativa
            const cardToMove = this.activeQueue.splice(this.currentCardIndex, 1)[0];
            const newPos = Math.min(this.currentCardIndex + 5, this.activeQueue.length);
            this.activeQueue.splice(newPos, 0, cardToMove);
        } else if (rating === "wrong") {
            // Re-insere 2 posições à frente (reforço super imediato)
            const cardToMove = this.activeQueue.splice(this.currentCardIndex, 1)[0];
            const newPos = Math.min(this.currentCardIndex + 2, this.activeQueue.length);
            this.activeQueue.splice(newPos, 0, cardToMove);
        }

        this.emitQueueUpdate();

        if (this.currentCardIndex < this.activeQueue.length) {
            EventBus.emit("card:load", this.activeQueue[this.currentCardIndex]);
        } else {
            EventBus.emit("session:completed", {
                sessionCount: this.sessionCount,
                sessionSuccessCount: this.sessionSuccessCount
            });
        }
    },

    /**
     * Incrementa o streak se for o primeiro estudo clínico de um novo dia.
     */
    updateStreak() {
        const todayStr = new Date().toISOString().split("T")[0];
        
        if (this.streakState.lastDate !== todayStr) {
            if (this.streakState.lastDate) {
                const lastDate = new Date(this.streakState.lastDate);
                const today = new Date(todayStr);
                const diffTime = Math.abs(today - lastDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    this.streakState.count += 1;
                } else if (diffDays > 1) {
                    this.streakState.count = 1;
                }
            } else {
                this.streakState.count = 1;
            }
            
            this.streakState.lastDate = todayStr;
            Storage.saveStreak(this.streakState);
            EventBus.emit("streak:update", this.streakState.count);
        }
    },

    /**
     * Transmite indicadores atualizados da fila.
     */
    emitQueueUpdate() {
        const remaining = this.activeQueue.length - this.currentCardIndex;
        const completedPercent = this.activeQueue.length > 0 ? Math.round((this.currentCardIndex / this.activeQueue.length) * 100) : 100;
        
        EventBus.emit("queue:update", { remaining, completedPercent });
    },

    /**
     * Transmite os dados gerais consolidados do progresso no repositório.
     */
    emitStatsUpdate() {
        const progress = Storage.loadProgress();
        let mastered = 0;
        let learning = 0;
        let newCount = 0;

        FLASHCARD_DATA.forEach(card => {
            const state = progress[card.id];
            if (!state || state.status === "new") {
                newCount++;
            } else if (state.status === "mastered") {
                mastered++;
            } else if (state.status === "learning") {
                learning++;
            }
        });

        const total = FLASHCARD_DATA.length;
        const masteredPercent = total > 0 ? Math.round((mastered / total) * 100) : 0;

        // Contadores das filter-pills do sidebar
        const filterCounts = {
            "Todos": total,
            "Radiografía": 0,
            "Tomografía": 0,
            "Signo_Radiológico": 0,
            "Patrón_Intersticial": 0
        };

        FLASHCARD_DATA.forEach(card => {
            card.tags.forEach(tag => {
                if (tag in filterCounts) {
                    filterCounts[tag]++;
                }
            });
        });

        EventBus.emit("stats:update", {
            mastered,
            learning,
            newCount,
            total,
            masteredPercent,
            filterCounts
        });
    }
};
