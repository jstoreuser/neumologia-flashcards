// ==========================================================================
// BARCL Workstation PACS Keyboard Shortcuts Manager
// ==========================================================================
import { EventBus } from "../core/event-bus.js";

export const Keyboard = {
    /**
     * Liga o ouvinte de eventos de teclado físico à página.
     * Mapeia atalhos estritamente produtivos para otimizar o tempo de estudo.
     */
    init() {
        document.addEventListener("keydown", (e) => {
            // Ignora atalhos se o foco estiver acidentalmente em elementos de texto editáveis
            if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) {
                return;
            }

            const code = e.code;
            const key = e.key;

            if (code === "Space") {
                e.preventDefault(); // Evita que o navegador role a página ao pressionar Espaço
                EventBus.emit("keyboard:space");
            } else if (key === "1") {
                EventBus.emit("keyboard:1"); // Erré (Wrong)
            } else if (key === "2") {
                EventBus.emit("keyboard:2"); // Difícil (Hard)
            } else if (key === "3") {
                EventBus.emit("keyboard:3"); // Fácil (Easy)
            }
        });
    }
};
