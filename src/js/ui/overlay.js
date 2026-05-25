// ==========================================================================
// BARCL Premium Cinematic Runtime Exception HUD Overlay
// ==========================================================================

export const ErrorOverlay = {
    /**
     * Inicializa os escutas de erro globais para interceptação de falhas físicas.
     */
    init() {
        window.addEventListener("error", (e) => {
            // Previne a quebra silenciosa padrão e exibe a workstation em alerta
            this.show(e.error || new Error(e.message), e.filename, e.lineno);
        });

        window.addEventListener("unhandledrejection", (e) => {
            this.show(e.reason || new Error("Unhandled Promise Rejection"));
        });
    },

    /**
     * Renderiza o painel de alerta de falha de sensor do HUD.
     */
    show(error, filename = "Core Engine", lineno = "N/A") {
        console.error("[BARCL Core Intercepted Exception]:", error);

        // Impede que múltiplos overlays de erro acumulem na tela
        if (document.getElementById("barcl-error-overlay")) return;

        const overlay = document.createElement("div");
        overlay.id = "barcl-error-overlay";
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(4, 6, 11, 0.96);
            backdrop-filter: blur(8px);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Space Grotesk', monospace;
            color: #ff2a5f;
            padding: 40px;
        `;

        const box = document.createElement("div");
        box.style.cssText = `
            max-width: 680px;
            width: 100%;
            background: #080b11;
            border: 2px solid #ff2a5f;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 0 45px rgba(255, 42, 95, 0.45), inset 0 0 20px rgba(255, 42, 95, 0.15);
            position: relative;
            overflow: hidden;
            animation: pulse-border 2s infinite alternate;
        `;

        // Adiciona scanlines animadas de fundo
        const scanline = document.createElement("div");
        scanline.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(rgba(255, 42, 95, 0) 50%, rgba(255, 42, 95, 0.05) 50%), linear-gradient(90deg, rgba(255, 42, 95, 0.01), rgba(255, 42, 95, 0.01));
            background-size: 100% 4px, 4px 100%;
            pointer-events: none;
        `;
        box.appendChild(scanline);

        const cleanMessage = error.message || "An unhandled exception occurred in the workstation execution thread.";
        const stackTrace = error.stack ? error.stack.split("\n").slice(0, 4).join("\n") : "Stack trace unavailable.";

        box.innerHTML += `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; border-bottom: 1px dashed rgba(255,42,95,0.3); padding-bottom: 16px;">
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #ff2a5f; filter: drop-shadow(0 0 8px #ff2a5f);"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <h1 style="font-size: 18px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; margin: 0; text-shadow: 0 0 10px rgba(255,42,95,0.6);">BARCL RUNTIME EXCEPTION</h1>
            </div>
            <div style="margin-bottom: 20px; font-size: 13px; color: #f8fafc; line-height: 1.6;">
                <div style="text-transform: uppercase; font-size: 10px; color: #475569; letter-spacing: 0.1em; margin-bottom: 4px;">Incident Details</div>
                <div style="background: rgba(255,42,95,0.04); border-left: 3px solid #ff2a5f; padding: 12px 16px; border-radius: 0 6px 6px 0; font-family: monospace; font-size: 13px; color: #ff8fa9;">
                    <strong>${cleanMessage}</strong>
                </div>
            </div>
            <div style="margin-bottom: 20px; font-size: 11px; color: #94a3b8; line-height: 1.6;">
                <div style="text-transform: uppercase; font-size: 10px; color: #475569; letter-spacing: 0.1em; margin-bottom: 4px;">Trace Location</div>
                <div style="background: #04060b; border: 1px solid rgba(255,255,255,0.03); padding: 10px 14px; border-radius: 6px; font-family: monospace; font-size: 11px; white-space: pre-wrap; word-break: break-all;">
File: ${filename}
Line: ${lineno}
                </div>
            </div>
            <div style="margin-bottom: 24px; font-size: 11px; color: #94a3b8; line-height: 1.6;">
                <div style="text-transform: uppercase; font-size: 10px; color: #475569; letter-spacing: 0.1em; margin-bottom: 4px;">Console Callstack</div>
                <div style="background: #04060b; border: 1px solid rgba(255,255,255,0.03); padding: 10px 14px; border-radius: 6px; font-family: monospace; font-size: 11px; white-space: pre-wrap; color: #94a3b8; max-height: 120px; overflow-y: auto;">
${stackTrace}
                </div>
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button onclick="window.location.reload()" style="background: #ff2a5f; border: none; color: #ffffff; padding: 10px 20px; border-radius: 6px; font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; transition: background 0.2s; box-shadow: 0 0 15px rgba(255,42,95,0.4);">
                    REBOOT WORKSTATION
                </button>
            </div>
        `;

        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }
};
