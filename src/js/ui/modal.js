// ==========================================================================
// BARCL Lightbox Lightroom Zoom Interface Controller
// ==========================================================================

export const Modal = {
    lightbox: null,
    lightboxImg: null,

    /**
     * Inicializa referências DOM e amarra eventos de fechamento do lightbox.
     */
    init() {
        this.lightbox = document.getElementById("lightbox");
        this.lightboxImg = document.getElementById("lightbox-img");
        const lightboxClose = document.getElementById("lightbox-close");

        if (this.lightbox) {
            this.lightbox.addEventListener("click", () => this.close());
            
            if (this.lightboxImg) {
                this.lightboxImg.addEventListener("click", (e) => e.stopPropagation()); // Evita fechar ao clicar no próprio raio-x
            }
            
            if (lightboxClose) {
                lightboxClose.addEventListener("click", () => this.close());
            }

            // Escuta tecla ESC para fechar zoom
            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape") {
                    this.close();
                }
            });
        }
    },

    /**
     * Abre a visualização em zoom e bloqueia rolagem do fundo.
     */
    open(imgUrl) {
        if (this.lightbox && this.lightboxImg) {
            this.lightboxImg.src = imgUrl;
            this.lightbox.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }
    },

    /**
     * Fecha o zoom e restaura a rolagem.
     */
    close() {
        if (this.lightbox && this.lightboxImg) {
            this.lightbox.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
            this.lightboxImg.src = "";
        }
    }
};
