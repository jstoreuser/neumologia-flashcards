// ==========================================================================
// BARCL Minimalist Event Bus (Ultra-lightweight PubSub Pattern)
// ==========================================================================

export const EventBus = {
    events: {},

    /**
     * Registra um ouvinte para um evento específico.
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        return () => this.off(event, callback); // Retorna função de unsubscribe automática
    },

    /**
     * Remove um ouvinte de um evento.
     */
    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    },

    /**
     * Dispara um evento transmitindo dados para todos os ouvintes.
     */
    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => {
            try {
                callback(data);
            } catch (err) {
                // Emite um erro interno que poderá ser capturado pelo Runtime Error Overlay
                window.dispatchEvent(new ErrorEvent('error', {
                    error: err,
                    message: `[EventBus Error] Event "${event}": ${err.message}`
                }));
            }
        });
    }
};
