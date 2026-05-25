// ==========================================================================
// BARCL Premium Atmospheric Animation & Transition Controller
// ==========================================================================

export const Animations = {
    ambientVideo: null,
    heroHeight: 800,

    /**
     * Cacheia a altura da tela e inicializa o ouvinte de rolagem otimizado com rAF.
     */
    init() {
        this.ambientVideo = document.querySelector(".ambient-video-bg");
        
        if (this.ambientVideo) {
            this.heroHeight = window.innerHeight || 800;

            // Escuta mudanças de redimensionamento de forma passiva para re-cachear limites
            window.addEventListener("resize", () => {
                this.heroHeight = window.innerHeight || 800;
            }, { passive: true });

            let ticking = false;

            window.addEventListener("scroll", () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        this.updateScrollVideoFade();
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        }
    },

    /**
     * Realiza a atenuação da opacidade do vídeo da Hero com base na rolagem.
     * Escreve no DOM apenas quando estritamente necessário para economizar ciclos de GPU.
     */
    updateScrollVideoFade() {
        if (!this.ambientVideo) return;
        
        const scrollPos = window.scrollY;
        const fadeThreshold = this.heroHeight * 0.8;

        if (scrollPos <= fadeThreshold) {
            const maxOpacity = 0.45;
            const newOpacity = maxOpacity * (1 - scrollPos / fadeThreshold);
            this.ambientVideo.style.opacity = newOpacity;
        } else if (this.ambientVideo.style.opacity !== "0") {
            this.ambientVideo.style.opacity = 0;
        }
    }
};
