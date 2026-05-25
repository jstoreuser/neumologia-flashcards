// ==========================================================================
// BARCL PACS Scanner Loader Interface Controller
// ==========================================================================

export const Loader = {
    el: null,

    /**
     * Liga a referência do DOM para o micro-loader PACS.
     */
    init() {
        this.el = document.getElementById("card-loader");
    },

    /**
     * Mostra o laser de escaneamento de exames ativos.
     */
    show() {
        if (this.el) {
            this.el.classList.remove("hidden");
        }
    },

    /**
     * Oculta o scanner de exames.
     */
    hide() {
        if (this.el) {
            this.el.classList.add("hidden");
        }
    }
};
