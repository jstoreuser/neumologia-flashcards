// ==========================================================================
// BARCL Defensive Storage Manager (localStorage wrapper)
// ==========================================================================

export const Storage = {
    keys: {
        PROGRESS: "pacs_progress_data",
        STREAK: "pacs_streak_data"
    },

    /**
     * Carrega os dados de progresso do usuário de forma defensiva.
     */
    loadProgress() {
        try {
            const raw = localStorage.getItem(this.keys.PROGRESS);
            return raw ? JSON.parse(raw) : {};
        } catch (err) {
            this.handleError("loadProgress", err);
            return {};
        }
    },

    /**
     * Salva os dados de progresso do usuário com segurança.
     */
    saveProgress(progress) {
        try {
            localStorage.setItem(this.keys.PROGRESS, JSON.stringify(progress));
            return true;
        } catch (err) {
            this.handleError("saveProgress", err);
            return false;
        }
    },

    /**
     * Carrega o estado de dias seguidos (streak) de estudo.
     */
    loadStreak() {
        try {
            const raw = localStorage.getItem(this.keys.STREAK);
            return raw ? JSON.parse(raw) : { count: 0, lastDate: null };
        } catch (err) {
            this.handleError("loadStreak", err);
            return { count: 0, lastDate: null };
        }
    },

    /**
     * Salva o estado de streak atualizado.
     */
    saveStreak(streak) {
        try {
            localStorage.setItem(this.keys.STREAK, JSON.stringify(streak));
            return true;
        } catch (err) {
            this.handleError("saveStreak", err);
            return false;
        }
    },

    /**
     * Limpa de forma absoluta todo o progresso do usuário (Reset Global).
     */
    clearAll() {
        try {
            localStorage.removeItem(this.keys.PROGRESS);
            localStorage.removeItem(this.keys.STREAK);
            return true;
        } catch (err) {
            this.handleError("clearAll", err);
            return false;
        }
    },

    /**
     * Trata erros lançando exceções estruturadas que o visual engine possa interceptar.
     */
    handleError(action, err) {
        const customErr = new Error(`[Storage Error] failed on "${action}": ${err.message}`);
        window.dispatchEvent(new ErrorEvent('error', {
            error: customErr,
            message: customErr.message
        }));
    }
};
