// ==========================================================================
// BARCL Clinical Image Viewer (PACS Monitor Controller with Fallback HUD)
// ==========================================================================
import { Modal } from "./modal.js";

export const Viewer = {
    gridEl: null,

    /**
     * Liga a referência DOM da grid de imagens médicas.
     */
    init() {
        this.gridEl = document.getElementById("card-images-grid");
    },

    /**
     * Renderiza as imagens do card de forma defensiva e otimizada.
     */
    renderImages(card) {
        if (!this.gridEl) return;
        this.gridEl.innerHTML = "";

        // 1. Validação defensiva de dados
        if (!card.images || card.images.length === 0) {
            this.renderEmptyPlaceholder(card.pageNumber, "NO IMAGES REGISTERED IN DATASET");
            return;
        }

        // 2. Loop de injeção das imagens
        card.images.forEach(imgUrl => {
            const imgEl = document.createElement("img");
            imgEl.src = imgUrl;
            imgEl.className = "card-image-web";
            imgEl.alt = `Estudio PACS / Página ${card.pageNumber}`;
            
            // Lazy loading nativo do navegador para otimização extrema de performance
            imgEl.loading = "lazy";

            // Click Zoom
            imgEl.addEventListener("click", (e) => {
                e.stopPropagation();
                Modal.open(imgUrl);
            });

            // Tratamento estético de falhas de carregamento (PACS Diagnostic Placeholder)
            imgEl.addEventListener("error", () => {
                this.replaceWithErrorPlaceholder(imgEl, card.pageNumber, imgUrl);
            });

            this.gridEl.appendChild(imgEl);
        });
    },

    /**
     * Substitui a imagem quebrada por um placeholder estético imersivo do HUD.
     */
    replaceWithErrorPlaceholder(imgEl, pageNumber, failedUrl) {
        const placeholder = document.createElement("div");
        placeholder.className = "pacs-image-placeholder-error";
        placeholder.style.cssText = `
            flex: 1 1 240px;
            min-height: 280px;
            background: #020306;
            border: 1px dashed #ff2a5f;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            color: #ff2a5f;
            padding: 24px;
            font-family: 'Space Grotesk', monospace;
            text-align: center;
            position: relative;
            overflow: hidden;
            box-shadow: inset 0 0 20px rgba(255, 42, 95, 0.15);
            animation: pulse-border-err 2s infinite alternate;
        `;

        // HUD scanline de alerta
        const scanline = document.createElement("div");
        scanline.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(rgba(255,42,95,0) 50%, rgba(255,42,95,0.06) 50%);
            background-size: 100% 4px;
            pointer-events: none;
        `;
        placeholder.appendChild(scanline);

        const filename = failedUrl.split('/').pop() || "Unknown Asset";

        placeholder.innerHTML += `
            <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 6px rgba(255,42,95,0.5));"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
            <div style="font-size: 12px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase;">IMAGE DATA UNAVAILABLE</div>
            <div style="font-size: 9px; color: #475569; letter-spacing: 0.05em; line-height: 1.4; text-transform: uppercase; word-break: break-all;">
                PACS SENSOR FAULT / ORIGEN PÁG. ${pageNumber}<br>
                ${filename}
            </div>
        `;

        if (imgEl.parentNode) {
            imgEl.parentNode.replaceChild(placeholder, imgEl);
        }
    },

    /**
     * Renderiza um placeholder neutro de base caso não haja imagens registradas.
     */
    renderEmptyPlaceholder(pageNumber, reason) {
        if (!this.gridEl) return;
        this.gridEl.innerHTML = `
            <div class="pacs-image-placeholder-empty" style="
                width: 100%;
                min-height: 280px;
                background: #020306;
                border: 1px dashed rgba(255,255,255,0.08);
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 16px;
                color: var(--text-muted);
                padding: 24px;
                font-family: 'Space Grotesk', monospace;
                text-align: center;
                box-shadow: inset 0 0 20px rgba(255,255,255,0.01);
            ">
                <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-secondary);">${reason}</div>
                <div style="font-size: 9px; color: var(--text-muted); letter-spacing: 0.05em; text-transform: uppercase;">
                    ESTACIÓN PACS / ORIGEN PÁGINA ${pageNumber}
                </div>
            </div>
        `;
    }
};
